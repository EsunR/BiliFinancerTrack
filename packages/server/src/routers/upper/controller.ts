import type {
  PickServerReq,
  PickServerRes,
  POST_UPPERS_CREATE_API,
  GET_UPPERS_LIST_API,
  GET_UPPERS_DETAIL_API,
  POST_UPPERS_SYNC_API,
  DELETE_UPPERS_DELETE_API,
  DeleteUppersDeleteRes,
} from '@express-vue-template/types/api';
import { VideoStatusEnum } from '@express-vue-template/types/model';
import db from '@server/db';
import analysisModel from '@server/model/Analysis';
import transcriptModel from '@server/model/Transcript';
import upperModel from '@server/model/Upper';
import videoModel from '@server/model/Video';
import { biliApiAutoRetry, getBiliClient } from '@server/utils/bili';

/**
 * 解析视频时长字符串（如 "05:58"）为秒数
 */
export function parseDuration(durationStr: string): number {
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * 新增 UP 主
 */
export async function postUppersCreate(
  uid: number | string
): Promise<PickServerRes<typeof POST_UPPERS_CREATE_API>> {
  const uidValue = typeof uid === 'string' ? Number(uid) : uid;
  if (!Number.isFinite(uidValue)) {
    throw new Error('uid 必须为数字');
  }

  let record = await upperModel.findOne({ where: { uid: uidValue } });
  if (!record) {
    const biliClient = getBiliClient();
    const userInfo = await biliApiAutoRetry(() =>
      biliClient.user.getUserInfo(uidValue)
    );
    const name = userInfo.name;
    const avatar = userInfo.face;

    if (!name) {
      throw new Error('无法获取 UP 主信息');
    }

    record = await upperModel.create({
      uid: uidValue,
      name,
      avatar,
    });
  } else {
    throw new Error('400-UP 主已存在');
  }

  return {
    id: record.id,
    uid: record.uid,
    name: record.name,
    avatar: record.avatar,
    createdAt: record.createdAt,
  };
}

/**
 * 获取 UP 主列表
 */
export async function getUppersList(): Promise<
  PickServerRes<typeof GET_UPPERS_LIST_API>
> {
  const records = await upperModel.findAll({
    order: [['createdAt', 'DESC']],
  });

  return records.map((record) => ({
    id: record.id,
    uid: record.uid,
    name: record.name,
    avatar: record.avatar,
    createdAt: record.createdAt,
  }));
}

/**
 * 获取 UP 主详情
 */
export async function getUppersDetail(
  id: number
): Promise<PickServerRes<typeof GET_UPPERS_DETAIL_API>> {
  if (!Number.isFinite(id)) {
    throw new Error('id 必须为数字');
  }

  const record = await upperModel.findByPk(id);
  if (!record) {
    throw new Error('UP 主不存在');
  }

  const videoCount = await videoModel.count({ where: { upperId: id } });

  return {
    id: record.id,
    uid: record.uid,
    name: record.name,
    avatar: record.avatar,
    createdAt: record.createdAt,
    videoCount,
  };
}

/**
 * 同步 UP 主视频
 */
export async function postUppersSyncVideos(
  id: number
): Promise<PickServerRes<typeof POST_UPPERS_SYNC_API>> {
  if (!Number.isFinite(id)) {
    throw new Error('id 必须为数字');
  }

  const record = await upperModel.findByPk(id);
  if (!record) {
    throw new Error('UP 主不存在');
  }

  const biliClient = getBiliClient();

  // 获取 UP 主的视频列表
  const data = await biliApiAutoRetry(() =>
    biliClient.user.getVideos({
      mid: record.uid,
    })
  );

  const videoList = data.list?.vlist || [];

  // 过滤出 upper 记录创建之后的视频
  const videosAfterCreation = videoList.filter(() => true);

  // 获取数据库中已存在的 bvid 列表
  const existingVideos = await videoModel.findAll({
    where: { upperId: id },
    attributes: ['bvid'],
  });
  const existingBvids = new Set(
    existingVideos.map((v) => v.bvid.split(',')[0])
  );

  // 过滤出新增的视频
  const newVideos = videosAfterCreation.filter(
    (video) => !existingBvids.has(video.bvid)
  );

  let latestVideoId: number | null = null;

  // 批量创建新视频记录
  if (newVideos.length > 0) {
    const videosToCreate = newVideos.map((video) => ({
      upperId: id,
      coverUrl: video.pic,
      bvid: `${video.bvid},${video.aid},${video.mid}`,
      title: video.title,
      duration: parseDuration(video.length),
      publishAt: new Date(video.created * 1000),
      videoType: 'video' as const,
      status: VideoStatusEnum.PENDING,
    }));

    const createdVideos = await videoModel.bulkCreate(videosToCreate);
    if (createdVideos.length > 0) {
      latestVideoId = createdVideos[0].id;
    }
  }

  return {
    upperId: id,
    syncCount: newVideos.length,
    totalCount: videoList.length,
    latestVideoId,
    syncAt: new Date(),
  };
}

/**
 * 删除 UP 主
 */
export async function deleteUpper(
  id: number
): Promise<PickServerRes<typeof DELETE_UPPERS_DELETE_API>> {
  if (!Number.isFinite(id)) {
    throw new Error('id 必须为数字');
  }

  const record = await upperModel.findByPk(id);
  if (!record) {
    throw new Error('UP 主不存在');
  }

  const transaction = await db.sequelize.transaction();
  try {
    const videoRecords = await videoModel.findAll({
      where: { upperId: id },
      attributes: ['id'],
      transaction,
    });
    const videoIds = videoRecords.map((video) => String(video.id));

    const deletedAnalysisCount = videoIds.length
      ? await analysisModel.destroy({
          where: { videoId: videoIds },
          transaction,
        })
      : 0;

    const deletedTranscriptCount = videoIds.length
      ? await transcriptModel.destroy({
          where: { videoId: videoIds },
          transaction,
        })
      : 0;

    const deletedVideoCount = await videoModel.destroy({
      where: { upperId: id },
      transaction,
    });

    await upperModel.destroy({
      where: { id },
      transaction,
    });

    await transaction.commit();

    return {
      id,
      deletedVideoCount,
      deletedAnalysisCount,
      deletedTranscriptCount,
    } as DeleteUppersDeleteRes;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
