import { GET_HOLDINGS_LIST_API, POST_HOLDINGS_UPDATE_API } from '.';
import { HoldingAttributes } from '../../model/holding';

export type GetHoldingsListReq = Record<string, never>;

export type GetHoldingsListRes = HoldingAttributes[];

export interface PostHoldingsUpdateReq {
  holdings: Array<
    Pick<HoldingAttributes, 'name' | 'code' | 'percent' | 'profit'>
  >;
}

export interface PostHoldingsUpdateRes {
  success: boolean;
}

export interface HoldingsApi {
  [GET_HOLDINGS_LIST_API]: {
    req: GetHoldingsListReq;
    res: GetHoldingsListRes;
  };
  [POST_HOLDINGS_UPDATE_API]: {
    req: PostHoldingsUpdateReq;
    res: PostHoldingsUpdateRes;
  };
}
