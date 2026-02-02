import request from '@client/utils/request';
import {
  GET_DAILYREPORTS_LIST_API,
  GET_DAILYREPORTS_MONTH_API,
  POST_DAILYREPORTS_GENERATE_API,
  PickServerReq,
  PickServerRes,
} from '@express-vue-template/types/api';
import { AxiosResponse } from 'axios';

/**
 * 生成日报
 */
export async function postDailyReportsGenerate(
  body?: PickServerReq<typeof POST_DAILYREPORTS_GENERATE_API>
) {
  return (await request.post(
    POST_DAILYREPORTS_GENERATE_API,
    body
  )) as AxiosResponse<PickServerRes<typeof POST_DAILYREPORTS_GENERATE_API>>;
}

/**
 * 获取日报列表
 */
export async function getDailyReportsList(
  params?: PickServerReq<typeof GET_DAILYREPORTS_LIST_API>
) {
  return (await request.get(GET_DAILYREPORTS_LIST_API, {
    params,
  })) as AxiosResponse<PickServerRes<typeof GET_DAILYREPORTS_LIST_API>>;
}

/**
 * 获取日报的月视图
 */
export async function getDailyReportsMonth(
  params: PickServerReq<typeof GET_DAILYREPORTS_MONTH_API>
) {
  return (await request.get(GET_DAILYREPORTS_MONTH_API, {
    params,
  })) as AxiosResponse<PickServerRes<typeof GET_DAILYREPORTS_MONTH_API>>;
}
