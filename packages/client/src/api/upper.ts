import request from '@client/utils/request';
import {
  DELETE_UPPERS_DELETE_API,
  GET_UPPERS_DETAIL_API,
  GET_UPPERS_LIST_API,
  POST_UPPERS_CREATE_API,
  POST_UPPERS_SYNC_API,
  PickServerReq,
  PickServerRes,
} from '@express-vue-template/types/api';
import { AxiosResponse } from 'axios';

export async function postUppersCreate(
  data: PickServerReq<typeof POST_UPPERS_CREATE_API>
) {
  return (await request.post(POST_UPPERS_CREATE_API, data)) as AxiosResponse<
    PickServerRes<typeof POST_UPPERS_CREATE_API>
  >;
}

export async function getUppersList(
  params?: PickServerReq<typeof GET_UPPERS_LIST_API>
) {
  return (await request.get(GET_UPPERS_LIST_API, { params })) as AxiosResponse<
    PickServerRes<typeof GET_UPPERS_LIST_API>
  >;
}

export async function getUppersDetail(
  params: PickServerReq<typeof GET_UPPERS_DETAIL_API>
) {
  return (await request.get(GET_UPPERS_DETAIL_API, {
    params,
  })) as AxiosResponse<PickServerRes<typeof GET_UPPERS_DETAIL_API>>;
}

export async function postUppersSync(
  params: PickServerReq<typeof POST_UPPERS_SYNC_API>
) {
  return (await request.post(POST_UPPERS_SYNC_API, null, {
    params,
  })) as AxiosResponse<PickServerRes<typeof POST_UPPERS_SYNC_API>>;
}

export async function deleteUppersDelete(
  params: PickServerReq<typeof DELETE_UPPERS_DELETE_API>
) {
  return (await request.delete(DELETE_UPPERS_DELETE_API, {
    params,
  })) as AxiosResponse<PickServerRes<typeof DELETE_UPPERS_DELETE_API>>;
}
