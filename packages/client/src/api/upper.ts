import request from '@client/utils/request';
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
import { AxiosResponse } from 'axios';

/**
 * 创建 UP 主
 */
export async function postUppersCreate(
  data: PickServerReq<typeof POST_UPPERS_CREATE_API>
) {
  return (await request.post(POST_UPPERS_CREATE_API, data)) as AxiosResponse<
    PickServerRes<typeof POST_UPPERS_CREATE_API>
  >;
}

/**
 * 获取 UP 主列表
 */
export async function getUppersList(
  params?: PickServerReq<typeof GET_UPPERS_LIST_API>
) {
  return (await request.get(GET_UPPERS_LIST_API, { params })) as AxiosResponse<
    PickServerRes<typeof GET_UPPERS_LIST_API>
  >;
}

/**
 * 获取 UP 主详情
 */
export async function getUppersDetail(
  params: PickServerReq<typeof GET_UPPERS_DETAIL_API>
) {
  return (await request.get(GET_UPPERS_DETAIL_API, {
    params,
  })) as AxiosResponse<PickServerRes<typeof GET_UPPERS_DETAIL_API>>;
}

/**
 * 同步 UP 主数据
 */
export async function postUppersSync(
  body: PickServerReq<typeof POST_UPPERS_SYNC_API>
) {
  return (await request.post(POST_UPPERS_SYNC_API, body)) as AxiosResponse<
    PickServerRes<typeof POST_UPPERS_SYNC_API>
  >;
}

/**
 * 删除 UP 主
 */
export async function deleteUppersDelete(
  params: PickServerReq<typeof DELETE_UPPERS_DELETE_API>
) {
  return (await request.delete(DELETE_UPPERS_DELETE_API, {
    params,
  })) as AxiosResponse<PickServerRes<typeof DELETE_UPPERS_DELETE_API>>;
}

/**
 * 同步目标日期所有 UP 主视频
 */
export async function postUppersSyncAll(
  params: PickServerReq<typeof POST_UPPERS_SYNC_ALL_API>
) {
  return (await request.post(POST_UPPERS_SYNC_ALL_API, params, {
    timeout: 60 * 1000,
  })) as AxiosResponse<PickServerRes<typeof POST_UPPERS_SYNC_ALL_API>>;
}
