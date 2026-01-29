import {
  DELETE_UPPERS_DELETE_API,
  GET_UPPERS_DETAIL_API,
  GET_UPPERS_LIST_API,
  POST_UPPERS_CREATE_API,
  POST_UPPERS_SYNC_API,
  PickServerReq,
  PickServerRes,
} from '@express-vue-template/types/api';
import { VideoStatusEnum } from '@express-vue-template/types/model';
import { autoRetry } from '@express-vue-template/utils';
import db from '@server/db';
import analysisModel from '@server/model/Analysis';
import transcriptModel from '@server/model/Transcript';
import upperModel from '@server/model/Upper';
import videoModel from '@server/model/Video';
import ResBody from '@server/struct/ResBody';
import { getBiliClient } from '@server/utils/bili';
import { Router } from 'express';
import { parseDuration } from './controller';

const upperRouter = Router();

/**
 * 新增 UP 主
 */
upperRouter.post(POST_UPPERS_CREATE_API, async (req, res) => {
  const { uid } = req.body as PickServerReq<typeof POST_UPPERS_CREATE_API>;
  const uidValue = typeof uid === 'string' ? Number(uid) : uid;
  if (!Number.isFinite(uidValue)) {
    throw new Error('uid 必须为数字');
  }

  let record = await upperModel.findOne({ where: { uid: uidValue } });
  if (!record) {
    const biliClient = getBiliClient();
    const userInfo = await autoRetry(() =>
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

    res.json(
      new ResBody({
        data: {
          id: record.id,
          uid: record.uid,
          name: record.name,
          avatar: record.avatar,
          createdAt: record.createdAt,
        } as PickServerRes<typeof POST_UPPERS_CREATE_API>,
      })
    );
  } else {
    throw new Error('400-UP 主已存在');
  }
});

/**
 * 获取 UP 主列表
 */
upperRouter.get(GET_UPPERS_LIST_API, async (req, res) => {
  const records = await upperModel.findAll({
    order: [['createdAt', 'DESC']],
  });

  res.json(
    new ResBody({
      data: records.map((record) => ({
        id: record.id,
        uid: record.uid,
        name: record.name,
        avatar: record.avatar,
        createdAt: record.createdAt,
      })) as PickServerRes<typeof GET_UPPERS_LIST_API>,
    })
  );
});

/**
 * 获取 UP 主详情
 */
upperRouter.get(GET_UPPERS_DETAIL_API, async (req, res) => {
  const { id } = req.query as unknown as PickServerReq<
    typeof GET_UPPERS_DETAIL_API
  >;
  if (!Number.isFinite(Number(id))) {
    throw new Error('id 必须为数字');
  }

  const upperId = Number(id);
  const record = await upperModel.findByPk(upperId);
  if (!record) {
    throw new Error('UP 主不存在');
  }

  const videoCount = await videoModel.count({ where: { upperId } });

  res.json(
    new ResBody({
      data: {
        id: record.id,
        uid: record.uid,
        name: record.name,
        avatar: record.avatar,
        createdAt: record.createdAt,
        videoCount,
      } as PickServerRes<typeof GET_UPPERS_DETAIL_API>,
    })
  );
});

/**
 * 同步 UP 主视频
 */
upperRouter.post(POST_UPPERS_SYNC_API, async (req, res) => {
  const { id } = req.body as unknown as PickServerReq<
    typeof POST_UPPERS_SYNC_API
  >;
  if (!Number.isFinite(Number(id))) {
    throw new Error('id 必须为数字');
  }

  const upperId = Number(id);
  const record = await upperModel.findByPk(upperId);
  if (!record) {
    throw new Error('UP 主不存在');
  }

  const biliClient = getBiliClient();

  // 获取 UP 主的视频列表
  const data = await autoRetry(() =>
    biliClient.user.getVideos({
      mid: record.uid,
    })
  );

  const videoList = data.list?.vlist || [];

  // 过滤出 upper 记录创建之后的视频
  const videosAfterCreation = videoList.filter((video) => {
    // const videoCreatedAt = new Date(video.created * 1000);
    // return videoCreatedAt >= record.createdAt;
    return true;
  });

  // 获取数据库中已存在的 bvid 列表
  const existingVideos = await videoModel.findAll({
    where: { upperId },
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
      upperId,
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

  res.json(
    new ResBody({
      data: {
        upperId,
        syncCount: newVideos.length,
        totalCount: videoList.length,
        latestVideoId,
        syncAt: new Date(),
      } as PickServerRes<typeof POST_UPPERS_SYNC_API>,
    })
  );
});

/**
 * 删除 UP 主
 */
upperRouter.delete(DELETE_UPPERS_DELETE_API, async (req, res) => {
  const { id } = req.query as unknown as PickServerReq<
    typeof DELETE_UPPERS_DELETE_API
  >;
  if (!Number.isFinite(Number(id))) {
    throw new Error('id 必须为数字');
  }

  const upperId = Number(id);
  const record = await upperModel.findByPk(upperId);
  if (!record) {
    throw new Error('UP 主不存在');
  }

  const transaction = await db.sequelize.transaction();
  try {
    const videoRecords = await videoModel.findAll({
      where: { upperId },
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
      where: { upperId },
      transaction,
    });

    await upperModel.destroy({
      where: { id: upperId },
      transaction,
    });

    await transaction.commit();

    res.json(
      new ResBody({
        data: {
          id: upperId,
          deletedVideoCount,
          deletedAnalysisCount,
          deletedTranscriptCount,
        } as PickServerRes<typeof DELETE_UPPERS_DELETE_API>,
      })
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

export default upperRouter;
