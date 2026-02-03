import {
  GET_DAILYREPORTS_LIST_API,
  GET_DAILYREPORTS_MONTH_API,
  POST_DAILYREPORTS_GENERATE_API,
} from '.';
import { DailyReportAttributes } from '../../model/dailyReport';

export interface PostDailyReportsGenerateReq {
  date?: string;
  videoIds?: number[];
}

export type PostDailyReportsGenerateRes = Record<string, never>;

export interface GetDailyReportsListReq {
  date?: string;
}

export interface GetDailyReportsListRes {
  list: DailyReportAttributes[];
  processing: boolean;
}

export interface GetDailyReportsMonthReq {
  /** 年份 */
  year: number;
  /** 月份 */
  month: number;
}

export interface DailyReportMonthItem {
  /** 日份 */
  day: number;
  /** 日报数量 */
  reportCount: number;
  /** 当日的视频数量 */
  videoCount: number;
}

export type GetDailyReportsMonthRes = DailyReportMonthItem[];

export interface DailyReportsApi {
  [POST_DAILYREPORTS_GENERATE_API]: {
    req: PostDailyReportsGenerateReq;
    res: PostDailyReportsGenerateRes;
  };
  [GET_DAILYREPORTS_LIST_API]: {
    req: GetDailyReportsListReq;
    res: GetDailyReportsListRes;
  };
  [GET_DAILYREPORTS_MONTH_API]: {
    req: GetDailyReportsMonthReq;
    res: GetDailyReportsMonthRes;
  };
}
