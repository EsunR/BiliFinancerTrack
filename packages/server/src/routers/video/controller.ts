import { VideoStatusEnum } from '@express-vue-template/types/model';
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
    whereConditions.upper_id = upperId;
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    whereConditions.publish_at = {
      [Op.gte]: startDate,
      [Op.lt]: endDate,
    };
  }

  // 获取视频列表
  const videos = await videoModel.findAll({
    where: whereConditions,
    order: [['publish_at', 'DESC']],
  });

  return await Promise.all(
    videos.map(async (video) => {
      const upper = await upperModel.findByPk(video.upper_id);
      return {
        id: video.id,
        bvid: video.bvid,
        title: video.title,
        cover_url: video.cover_url,
        duration: video.duration,
        publish_at: video.publish_at,
        video_type: video.video_type,
        status: video.status,
        status_failed: video.status_failed,
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
  const upper = await upperModel.findByPk(video.upper_id);
  if (!upper) {
    throw new Error('404-UP 主不存在');
  }

  // TODO: 获取转写信息（关联表查询）
  const transcript: GetVideosDetailRes['transcript'] = null;

  // TODO: 获取分析信息（关联表查询）
  const analysis: GetVideosDetailRes['analysis'] = null;

  return {
    id: video.id,
    upper_id: video.upper_id,
    upper_name: upper.name,
    bvid: video.bvid.split(',')[0],
    title: video.title,
    cover_url: video.cover_url,
    duration: video.duration,
    publish_at: video.publish_at,
    video_type: video.video_type,
    status: video.status,
    status_failed: video.status_failed,
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

  // 检查转写是否完成
  if (video.status !== VideoStatusEnum.COMPLETED) {
    throw new Error('视频转写未完成，无法进行分析');
  }

  // TODO: 检查是否已存在相同 promptVersion 的分析任务
  // TODO: 将任务加入队列
  const taskId = `task_${id}_${Date.now()}`;

  return {
    video_id: id,
    task_id: taskId,
    status: 'queued',
    message: '分析任务已加入队列，请通过查询接口获取进度',
    queue_position: 0, // TODO: 获取队列中的实际位置
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
    video_id: id,
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
