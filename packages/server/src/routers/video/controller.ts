import type {
  GetVideosAnalysisRes,
  GetVideosAnalysisVersionsRes,
  GetVideosDetailRes,
  GetVideosListRes,
} from '@express-vue-template/types/api/video/types';
import {
  TimestampSegment,
  VideoStatusEnum,
} from '@express-vue-template/types/model';
import { PUBLIC_DIR_PATH } from '@server/config/paths';
import analysisModel from '@server/model/Analysis';
import transcriptModel from '@server/model/Transcript';
import upperModel from '@server/model/Upper';
import videoModel from '@server/model/Video';
import { downloadVideo } from '@server/utils/bili';
import { convertVideoToAudio } from '@server/utils/ffmpeg';
import { deepSeekV3Chat } from '@server/utils/llm';
import { logger } from '@server/utils/log';
import { groqWhisper } from '@server/utils/transcriber';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { BASE_PROMPT } from './constances';
import {
  GET_VIDEOS_ANALYSIS_API,
  GET_VIDEOS_LIST_API,
  GET_VIDEOS_TRANSCRIPTS_API,
  PickServerRes,
} from '@express-vue-template/types/api';

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
        processing: video.processing,
        upper,
      } as PickServerRes<typeof GET_VIDEOS_LIST_API>[number];
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
    processing: video.processing,
  };
}

/**
 * 获取视频转写信息
 */
export async function getVideosTranscripts(
  id: number
): Promise<PickServerRes<typeof GET_VIDEOS_TRANSCRIPTS_API>> {
  if (!Number.isFinite(id)) {
    throw new Error('id 必须为数字');
  }

  const video = await videoModel.findByPk(id);
  if (!video) {
    throw new Error('404-视频不存在');
  }

  const transcripts = await transcriptModel.findAll({
    where: { videoId: id },
    order: [['id', 'ASC']],
  });

  return transcripts.map((t) => {
    return {
      id: (t as any).id,
      videoId: (t as any).videoId,
      content: (t as any).content,
      timestamps: (t as any).timestamps,
      partStartAt: (t as any).partStartAt,
      model: (t as any).model,
      modelOutputRaw: (t as any).modelOutputRaw,
      duration: (t as any).duration,
      createdAt: (t as any).createdAt,
      updatedAt: (t as any).updatedAt,
    } as any;
  });
}

/**
 * 触发视频分析
 */
export async function postVideosAnalyze(
  id: number,
  promptVersion: string,
  prompt: string
): Promise<void> {
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
    // === 下载视频 ===
    if (
      video.status === VideoStatusEnum.PENDING ||
      fs.existsSync(videoPath) === false
    ) {
      logger.info(`开始下载视频 ${bvid} ...`);
      await downloadVideo(bvid);
      logger.info(`视频 ${bvid} 下载完成`);
      await video.update({ status: VideoStatusEnum.DOWNLOADED });
    }
    // === 音频分离 ===
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
    // === AI 分析 ===
    if (video.status === VideoStatusEnum.TRANSCRIBED) {
      const transcripts = await transcriptModel.findAll({
        where: { videoId: id },
      });
      if (transcripts.length === 0) {
        return;
      }
      logger.info(`开始视频分析 ${bvid} ...`);
      const chatResponse = await deepSeekV3Chat.chat([
        {
          role: 'system',
          content: prompt || BASE_PROMPT,
        },
        {
          role: 'user',
          content: `视频内容如下：${transcripts
            .map((t) => t.content)
            .join('\n')}`,
        },
      ]);
      if (chatResponse) {
        analysisModel.create({
          content: chatResponse.content,
          videoId: id,
          promptVersion,
        });
        logger.info(`视频分析完成 ${bvid} ...`);
      }
    }
  }

  await video.update({ processing: true });
  processVideo()
    .catch((err) => {
      logger.error(`视频处理失败 ${video.bvid}：${err.message}`);
      video.update({ statusFailed: true });
    })
    .finally(async () => {
      await video.update({ processing: false });
    });
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

  const analyses = await analysisModel.findAll({
    where: { videoId: id },
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  const versions: GetVideosAnalysisVersionsRes['versions'] = analyses.map(
    (analysis) => {
      return {
        id: analysis.id,
        promptVersion: analysis.promptVersion,
        model: analysis.model,
      } as GetVideosAnalysisVersionsRes['versions'][number];
    }
  );

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

  const analysis = await analysisModel.findOne({
    where: {
      id: analysisId,
      videoId: id,
    },
  });

  if (!analysis) {
    throw new Error('404-分析不存在');
  }

  return {
    id: analysis.id,
    content: analysis.content,
    model: analysis.model,
    promptVersion: analysis.promptVersion,
    videoId: analysis.videoId,
  } as PickServerRes<typeof GET_VIDEOS_ANALYSIS_API>;
}
