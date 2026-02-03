import {
  DELETE_UPPERS_DELETE_API,
  GET_UPPERS_DETAIL_API,
  GET_UPPERS_LIST_API,
  POST_UPPERS_CREATE_API,
  POST_UPPERS_SYNC_ALL_API,
  POST_UPPERS_SYNC_API,
  PickServerReq,
  PickServerRes,
} from '@express-vue-template/types/api';
import ResBody from '@server/struct/ResBody';
import { Router } from 'express';
import * as upperController from './controller';

const upperRouter = Router();

/**
 * 新增 UP 主
 */
upperRouter.post(POST_UPPERS_CREATE_API, async (req, res) => {
  const { uid } = req.body as PickServerReq<typeof POST_UPPERS_CREATE_API>;

  const data = await upperController.addUpper(uid);

  res.json(
    new ResBody({
      data,
    })
  );
});

/**
 * 获取 UP 主列表
 */
upperRouter.get(GET_UPPERS_LIST_API, async (req, res) => {
  const data = await upperController.getUppersList();

  res.json(
    new ResBody({
      data,
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

  const idValue = typeof id === 'string' ? Number(id) : id;

  const data = await upperController.getUppersDetail(idValue);

  res.json(
    new ResBody({
      data,
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

  const idValue = typeof id === 'string' ? Number(id) : id;

  const data = await upperController.syncUpperVideo(idValue);

  res.json(
    new ResBody({
      data,
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

  const idValue = typeof id === 'string' ? Number(id) : id;

  const data = await upperController.deleteUpper(idValue);

  res.json(
    new ResBody({
      data,
    })
  );
});

/**
 * 同步目标日期的所有 UP 主视频
 */
upperRouter.post(POST_UPPERS_SYNC_ALL_API, async (req, res) => {
  const { date } = req.body as PickServerReq<typeof POST_UPPERS_SYNC_ALL_API>;

  const result = await upperController.syncAndAnalyzeAllUppersVideo(date);

  res.json(
    new ResBody({
      data: result as PickServerRes<typeof POST_UPPERS_SYNC_ALL_API>,
    })
  );
});

export default upperRouter;
