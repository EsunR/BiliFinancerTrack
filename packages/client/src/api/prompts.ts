import request from '@client/utils/request';
import {
  GET_PROMPTS_LIST_API,
  POST_PROMPTS_CREATE_API,
  POST_PROMPTS_SELECT_API,
  POST_PROMPTS_UPDATE_API,
  PickServerReq,
  PickServerRes,
} from '@express-vue-template/types/api';
import { AxiosResponse } from 'axios';

/**
 * 获取提示词列表
 */
export async function getPromptsList() {
  return (await request.get(GET_PROMPTS_LIST_API)) as AxiosResponse<
    PickServerRes<typeof GET_PROMPTS_LIST_API>
  >;
}

/**
 * 更新提示词
 */
export async function postPromptsUpdate(
  body: PickServerReq<typeof POST_PROMPTS_UPDATE_API>
) {
  return (await request.post(POST_PROMPTS_UPDATE_API, body)) as AxiosResponse<
    PickServerRes<typeof POST_PROMPTS_UPDATE_API>
  >;
}

/**
 * 新增提示词
 */
export async function postPromptsCreate(
  body: PickServerReq<typeof POST_PROMPTS_CREATE_API>
) {
  return (await request.post(POST_PROMPTS_CREATE_API, body)) as AxiosResponse<
    PickServerRes<typeof POST_PROMPTS_CREATE_API>
  >;
}

/**
 * 将提示词设为当前类型使用的提示词
 */
export async function postPromptsSelect(
  body: PickServerReq<typeof POST_PROMPTS_SELECT_API>
) {
  return (await request.post(POST_PROMPTS_SELECT_API, body)) as AxiosResponse<
    PickServerRes<typeof POST_PROMPTS_SELECT_API>
  >;
}
