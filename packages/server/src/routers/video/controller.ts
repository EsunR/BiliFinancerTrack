import {
  TimestampSegment,
  VideoStatusEnum,
} from '@express-vue-template/types/model';
import upperModel from '@server/model/Upper';
import videoModel from '@server/model/Video';
import { Op } from 'sequelize';
import type {
  GetVideosAnalysisRes,
  GetVideosAnalysisVersionsRes,
  GetVideosDetailRes,
  GetVideosListRes,
  PostVideosAnalyzeRes,
} from '@express-vue-template/types/api/video/types';
import { downloadVideo, getBiliClient } from '@server/utils/bili';
import path from 'path';
import { PUBLIC_DIR_PATH } from '@server/config/paths';
import fs from 'fs';
import { convertVideoToAudio } from '@server/utils/ffmpeg';
import { logger } from '@server/utils/log';
import { groqWhisper } from '@server/utils/transcriber';
import transcriptModel from '@server/model/Transcript';

/**
 * 获取UP主视频列表
 */
export async function getVideosList(
  upperId?: number,
  date?: string
): Promise<GetVideosListRes> {
  // 构建查询条件
  const whereConditions: any = {};

  if (upperId !== undefined) {
    if (!Number.isFinite(upperId)) {
      throw new Error('upperId 必须为数字');
    }
    whereConditions.upperId = upperId;
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    whereConditions.publishAt = {
      [Op.gte]: startDate,
      [Op.lt]: endDate,
    };
  }

  // 获取视频列表
  const videos = await videoModel.findAll({
    where: whereConditions,
    order: [['publishAt', 'DESC']],
  });

  return await Promise.all(
    videos.map(async (video) => {
      const upper = await upperModel.findByPk(video.upperId);
      return {
        id: video.id,
        bvid: video.bvid,
        title: video.title,
        coverUrl: video.coverUrl,
        duration: video.duration,
        publishAt: video.publishAt,
        videoType: video.videoType,
        status: video.status,
        statusFailed: video.statusFailed,
        upper,
      };
    })
  );
}

/**
 * 获取视频详情
 */
export async function getVideosDetail(id: number): Promise<GetVideosDetailRes> {
  if (!Number.isFinite(id)) {
    throw new Error('id 必须为数字');
  }

  const video = await videoModel.findByPk(id);
  if (!video) {
    throw new Error('404-视频不存在');
  }

  // 获取 UP 主信息
  const upper = await upperModel.findByPk(video.upperId);
  if (!upper) {
    throw new Error('404-UP 主不存在');
  }

  // TODO: 获取转写信息（关联表查询）
  const transcript: GetVideosDetailRes['transcript'] = null;

  // TODO: 获取分析信息（关联表查询）
  const analysis: GetVideosDetailRes['analysis'] = null;

  return {
    id: video.id,
    upperId: video.upperId,
    upperName: upper.name,
    bvid: video.bvid.split(',')[0],
    title: video.title,
    coverUrl: video.coverUrl,
    duration: video.duration,
    publishAt: video.publishAt,
    videoType: video.videoType,
    status: video.status,
    statusFailed: video.statusFailed,
    transcript,
    analysis,
  };
}

/**
 * 触发视频分析
 */
export async function postVideosAnalyze(
  id: number,
  promptVersion: string = 'default'
): Promise<PostVideosAnalyzeRes> {
  if (!Number.isFinite(id)) {
    throw new Error('id 必须为数字');
  }

  const video = await videoModel.findByPk(id);
  if (!video) {
    throw new Error('404-视频不存在');
  }

  async function processVideo() {
    const bvid = video.bvid.split(',')[0];
    const videoPath = path.join(
      PUBLIC_DIR_PATH,
      'downloads/videos',
      `${bvid}.mp4`
    );
    const audioPath = path.join(
      PUBLIC_DIR_PATH,
      'downloads/videos',
      `${bvid}.mp3`
    );
    await video.update({ status: VideoStatusEnum.PENDING });
    if (
      video.status === VideoStatusEnum.PENDING ||
      fs.existsSync(videoPath) === false
    ) {
      logger.info(`开始下载视频 ${bvid} ...`);
      await downloadVideo(bvid);
      logger.info(`视频 ${bvid} 下载完成`);
      await video.update({ status: VideoStatusEnum.DOWNLOADED });
    }
    if (
      video.status === VideoStatusEnum.DOWNLOADED ||
      fs.existsSync(audioPath) === false
    ) {
      logger.info(`开始分离音频 ${bvid} ...`);
      await convertVideoToAudio(videoPath);
      logger.info(`视频 ${bvid} 音频分离完成`);
      await video.update({ status: VideoStatusEnum.AUDIO_EXTRACTED });
    }
    if (video.status === VideoStatusEnum.AUDIO_EXTRACTED) {
      logger.info(`开始语音转写 ${bvid} ...`);
      const audioTextInfo = await groqWhisper.audio2Text(audioPath);
      logger.info(`语音转写完成 ${bvid} ...`);
      // 创建音频分离表
      await transcriptModel.create({
        videoId: id,
        content: audioTextInfo.text,
        duration: audioTextInfo.duration,
        model: 'whisper-large-v3-turbo',
        modelOutputRaw: audioTextInfo.raw,
        partStartAt: 0,
        timestamps: audioTextInfo.segments.map(
          (seg) =>
            ({
              start: seg.start,
              end: seg.end,
              content: seg.text,
            } as TimestampSegment)
        ),
      });
      await video.update({ status: VideoStatusEnum.TRANSCRIBED });
    }
  }

  processVideo();

  return {
    videoId: id,
    taskId: '111',
    status: 'queued',
    message: '分析任务已加入队列，请通过查询接口获取进度',
    queuePosition: 0, // TODO: 获取队列中的实际位置
  };
}

/**
 * 获取分析版本列表
 */
export async function getVideosAnalysisVersions(
  id: number
): Promise<GetVideosAnalysisVersionsRes> {
  if (!Number.isFinite(id)) {
    throw new Error('id 必须为数字');
  }

  const video = await videoModel.findByPk(id);
  if (!video) {
    throw new Error('404-视频不存在');
  }

  // TODO: 从 Analysis 表查询该视频的所有分析版本
  const versions: GetVideosAnalysisVersionsRes['versions'] = [];

  return {
    videoId: id,
    versions,
  };
}

/**
 * 获取指定版本分析内容
 */
export async function getVideosAnalysis(
  id: number,
  analysisId: number
): Promise<GetVideosAnalysisRes> {
  if (!Number.isFinite(id)) {
    throw new Error('id 必须为数字');
  }
  if (!Number.isFinite(analysisId)) {
    throw new Error('analysisId 必须为数字');
  }

  const video = await videoModel.findByPk(id);
  if (!video) {
    throw new Error('404-视频不存在');
  }

  // TODO: 从 Analysis 表查询指定分析
  throw new Error('501-分析功能暂未实现');
}
