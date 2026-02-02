import {
  GET_VIDEOS_ANALYSIS_API,
  GET_VIDEOS_ANALYSIS_VERSIONS_API,
  GET_VIDEOS_DETAIL_API,
  GET_VIDEOS_LIST_API,
  GET_VIDEOS_TRANSCRIPTS_API,
  POST_VIDEOS_ANALYZE_API,
  PickServerReq,
  PickServerRes,
} from '@express-vue-template/types/api';
import ResBody from '@server/struct/ResBody';
import { verifyRequestArgs } from '@server/utils';
import { Router } from 'express';
import * as videoController from './controller';

const videoRouter = Router();

/**
 * 获取 UP 主视频列表
 */
videoRouter.get(GET_VIDEOS_LIST_API, async (req, res) => {
  const { upperId, date } = req.query as unknown as PickServerReq<
    typeof GET_VIDEOS_LIST_API
  >;

  const upperIdValue = upperId
    ? typeof upperId === 'string'
      ? Number(upperId)
      : upperId
    : undefined;

  const data = await videoController.getVideosList(
    upperIdValue,
    date as string | undefined
  );

  res.json(
    new ResBody({
      data,
    })
  );
});

/**
 * 获取视频详情
 */
videoRouter.get(GET_VIDEOS_DETAIL_API, async (req, res) => {
  const { id } = req.query as unknown as PickServerReq<
    typeof GET_VIDEOS_DETAIL_API
  >;

  const idValue = typeof id === 'string' ? Number(id) : id;

  const data = await videoController.getVideosDetail(idValue);

  res.json(
    new ResBody({
      data,
    })
  );
});

/**
 * 获取视频转写信息
 */
videoRouter.get(GET_VIDEOS_TRANSCRIPTS_API, async (req, res) => {
  const { id } = req.query as unknown as PickServerReq<
    typeof GET_VIDEOS_TRANSCRIPTS_API
  >;

  const idValue = typeof id === 'string' ? Number(id) : id;

  const data = await videoController.getVideosTranscripts(idValue);

  res.json(
    new ResBody({
      data,
    })
  );
});

/**
 * 触发视频分析
 */
videoRouter.post(POST_VIDEOS_ANALYZE_API, async (req, res, next) => {
  // 校验参数
  const vResult = verifyRequestArgs(req.body, [
    {
      key: 'id',
      required: true,
      type: 'number',
    },
  ]);
  if (!vResult.result) {
    throw new Error(vResult.errMsg);
  }

  let { id, prompt = '' } = req.body as unknown as PickServerReq<
    typeof POST_VIDEOS_ANALYZE_API
  >;

  const idValue = typeof id === 'string' ? Number(id) : id;

  await videoController.postVideosAnalyze(idValue, prompt);

  res.json(
    new ResBody({
      data: {} as PickServerRes<typeof POST_VIDEOS_ANALYZE_API>,
    })
  );
});

/**
 * 获取分析版本列表
 */
videoRouter.get(GET_VIDEOS_ANALYSIS_VERSIONS_API, async (req, res) => {
  const { id } = req.query as unknown as PickServerReq<
    typeof GET_VIDEOS_ANALYSIS_VERSIONS_API
  >;

  const idValue = typeof id === 'string' ? Number(id) : id;

  const data = await videoController.getVideosAnalysisVersions(idValue);

  res.json(
    new ResBody({
      data,
    })
  );
});

/**
 * 获取指定版本分析内容
 */
videoRouter.get(GET_VIDEOS_ANALYSIS_API, async (req, res) => {
  const { id, analysisId } = req.query as unknown as PickServerReq<
    typeof GET_VIDEOS_ANALYSIS_API
  >;

  const idValue = typeof id === 'string' ? Number(id) : id;
  const analysisIdValue =
    typeof analysisId === 'string' ? Number(analysisId) : analysisId;

  const data = await videoController.getVideosAnalysis(
    idValue,
    analysisIdValue
  );

  res.json(
    new ResBody({
      data,
    })
  );
});

export default videoRouter;
