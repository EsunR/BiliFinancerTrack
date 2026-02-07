import {
  GET_PROMPTS_LIST_API,
  POST_PROMPTS_CREATE_API,
  POST_PROMPTS_SELECT_API,
  POST_PROMPTS_UPDATE_API,
} from '.';
import { PromptAttributes, PromptType } from '../../model/prompt';

export type GetPromptsListReq = Record<string, never>;

export type GetPromptsListRes = PromptAttributes[];

export interface PostPromptsUpdateReq {
  id: number;
  content: string;
  note?: string;
}

export interface PostPromptsUpdateRes {
  success: boolean;
}

export interface PostPromptsCreateReq {
  type: PromptType;
  content: string;
  note?: string;
}

export interface PostPromptsCreateRes {
  success: boolean;
}

export interface PostPromptsSelectReq {
  id: number;
}

export interface PostPromptsSelectRes {
  success: boolean;
}

export interface PromptsApi {
  [GET_PROMPTS_LIST_API]: {
    req: GetPromptsListReq;
    res: GetPromptsListRes;
  };
  [POST_PROMPTS_UPDATE_API]: {
    req: PostPromptsUpdateReq;
    res: PostPromptsUpdateRes;
  };
  [POST_PROMPTS_CREATE_API]: {
    req: PostPromptsCreateReq;
    res: PostPromptsCreateRes;
  };
  [POST_PROMPTS_SELECT_API]: {
    req: PostPromptsSelectReq;
    res: PostPromptsSelectRes;
  };
}
