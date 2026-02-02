import { DailyReportsApi } from './dailyReports/types';
import { HoldingsApi } from './holdings/types';
import { UpperApi } from './upper';
import { VideoApi } from './video/types';

export type ServerAPI = UpperApi & VideoApi & DailyReportsApi & HoldingsApi;

export type PickServerReq<P extends keyof ServerAPI> = ServerAPI[P]['req'];
export type PickServerRes<P extends keyof ServerAPI> = ServerAPI[P]['res'];

export interface ResponseData<T = any> {
  success: boolean;
  data: T;
  msg: string;
}
export * from './upper';
export * from './video';
export * from './dailyReports';
export * from './holdings';
