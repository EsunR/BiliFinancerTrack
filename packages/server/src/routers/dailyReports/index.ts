import {
  GET_DAILYREPORTS_LIST_API,
  GET_DAILYREPORTS_MONTH_API,
  POST_DAILYREPORTS_GENERATE_API,
  PickServerReq,
  PickServerRes,
} from '@express-vue-template/types/api';
import ResBody from '@server/struct/ResBody';
import { Router } from 'express';
import * as dailyReportsController from './controller';

const dailyReportsRouter = Router();

/**
 * 生成日报
 */
dailyReportsRouter.post(POST_DAILYREPORTS_GENERATE_API, async (req, res) => {
  const { date, videoIds } = req.body as PickServerReq<
    typeof POST_DAILYREPORTS_GENERATE_API
  >;

  const resolvedVideoIds = (videoIds || [])
    .map((item) => (typeof item === 'string' ? Number(item) : item))
    .filter((item) => Number.isFinite(item));

  const data = await dailyReportsController.dailyReportsGenerate(
    date,
    resolvedVideoIds.length ? resolvedVideoIds : undefined
  );

  res.json(
    new ResBody({
      data: data as PickServerRes<typeof POST_DAILYREPORTS_GENERATE_API>,
    })
  );
});

/**
 * 获取日报列表
 */
dailyReportsRouter.get(GET_DAILYREPORTS_LIST_API, async (req, res) => {
  const { date } = req.query as unknown as PickServerReq<
    typeof GET_DAILYREPORTS_LIST_API
  >;

  const data = await dailyReportsController.getDailyReportsList(date);

  res.json(
    new ResBody({
      data,
    })
  );
});

/**
 * 获取日报的月视图
 */
dailyReportsRouter.get(GET_DAILYREPORTS_MONTH_API, async (req, res) => {
  const { year, month } = req.query as unknown as PickServerReq<
    typeof GET_DAILYREPORTS_MONTH_API
  >;

  const yearNum = typeof year === 'string' ? Number(year) : year;
  const monthNum = typeof month === 'string' ? Number(month) : month;

  if (!Number.isFinite(yearNum) || !Number.isFinite(monthNum)) {
    throw new Error('400-年份和月份必须是有效的数字');
  }

  if (monthNum < 1 || monthNum > 12) {
    throw new Error('400-月份必须在 1-12 之间');
  }

  const data = await dailyReportsController.getDailyReportsMonth(
    yearNum,
    monthNum
  );

  res.json(
    new ResBody({
      data,
    })
  );
});

export default dailyReportsRouter;
