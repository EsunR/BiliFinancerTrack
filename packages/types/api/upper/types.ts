import {
  GET_UPPERS_DETAIL_API,
  GET_UPPERS_LIST_API,
  POST_UPPERS_CREATE_API,
  POST_UPPERS_SYNC_API,
} from '.';
import { UpperAttributes } from '../../model/upper';

export interface PostUppersReq {
  uid: number;
}

export type PostUppersRes = Pick<
  UpperAttributes,
  'id' | 'uid' | 'name' | 'avatar' | 'created_at'
>;

export type GetUppersReq = Record<string, never>;

export type GetUppersRes = Array<
  Pick<UpperAttributes, 'id' | 'uid' | 'name' | 'avatar' | 'created_at'>
>;

export interface GetUppersDetailReq {
  id: number;
}

export interface GetUppersDetailRes
  extends Pick<
    UpperAttributes,
    'id' | 'uid' | 'name' | 'avatar' | 'created_at'
  > {
  video_count: number;
  summary_count: number;
}

export interface PostUppersSyncReq {
  id: number;
}

export interface PostUppersSyncRes {
  upper_id: number;
  sync_count: number;
  total_count: number;
  latest_video_id: number | null;
  sync_at: Date;
}

export interface UpperApi {
  [POST_UPPERS_CREATE_API]: {
    req: PostUppersReq;
    res: PostUppersRes;
  };
  [GET_UPPERS_LIST_API]: {
    req: GetUppersReq;
    res: GetUppersRes;
  };
  [GET_UPPERS_DETAIL_API]: {
    req: GetUppersDetailReq;
    res: GetUppersDetailRes;
  };
  [POST_UPPERS_SYNC_API]: {
    req: PostUppersSyncReq;
    res: PostUppersSyncRes;
  };
}
