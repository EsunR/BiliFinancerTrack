import {
  DELETE_UPPERS_DELETE_API,
  GET_UPPERS_DETAIL_API,
  GET_UPPERS_LIST_API,
  POST_UPPERS_CREATE_API,
  POST_UPPERS_SYNC_ALL_API,
  POST_UPPERS_SYNC_API,
} from '.';
import { UpperAttributes } from '../../model/upper';

export interface PostUppersReq {
  uid: number;
}

export type PostUppersRes = Pick<
  UpperAttributes,
  'id' | 'uid' | 'name' | 'avatar' | 'createdAt'
>;

export type GetUppersReq = Record<string, never>;

export type GetUppersRes = Array<
  Pick<UpperAttributes, 'id' | 'uid' | 'name' | 'avatar' | 'createdAt'> & {
    lastVideoPublishedAt: Date | null;
  }
>;

export interface GetUppersDetailReq {
  id: number;
}

export interface GetUppersDetailRes
  extends Pick<
    UpperAttributes,
    'id' | 'uid' | 'name' | 'avatar' | 'createdAt'
  > {
  videoCount: number;
}

export interface PostUppersSyncReq {
  id: number;
}

export interface PostUppersSyncRes {
  upperId: number;
  syncCount: number;
  totalCount: number;
  latestVideoId: number | null;
  syncAt: Date;
}

export interface DeleteUppersDeleteReq {
  id: number;
}

export interface DeleteUppersDeleteRes {
  id: number;
}

export interface PostUppersSyncAllReq {
  date: string;
}

export type PostUppersSyncAllRes = {
  upperName: string;
  addVideoCount: number;
  emitAnalyzeCount: number;
}[];

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
  [DELETE_UPPERS_DELETE_API]: {
    req: DeleteUppersDeleteReq;
    res: DeleteUppersDeleteRes;
  };
  [POST_UPPERS_SYNC_ALL_API]: {
    req: PostUppersSyncAllReq;
    res: PostUppersSyncAllRes;
  };
}
