import request from '@client/utils/request';
import {
  GET_HOLDINGS_LIST_API,
  POST_HOLDINGS_UPDATE_API,
  PickServerReq,
  PickServerRes,
} from '@express-vue-template/types/api';
import { AxiosResponse } from 'axios';

/**
 * 获取资产持仓列表
 */
export async function getHoldingsList() {
  return (await request.get(GET_HOLDINGS_LIST_API)) as AxiosResponse<
    PickServerRes<typeof GET_HOLDINGS_LIST_API>
  >;
}

/**
 * 更新资产持仓
 */
export async function postHoldingsUpdate(
  body: PickServerReq<typeof POST_HOLDINGS_UPDATE_API>
) {
  return (await request.post(POST_HOLDINGS_UPDATE_API, body)) as AxiosResponse<
    PickServerRes<typeof POST_HOLDINGS_UPDATE_API>
  >;
}
