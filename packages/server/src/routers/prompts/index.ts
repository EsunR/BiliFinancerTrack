import {
  GET_PROMPTS_LIST_API,
  POST_PROMPTS_CREATE_API,
  POST_PROMPTS_SELECT_API,
  POST_PROMPTS_UPDATE_API,
  PickServerReq,
  PickServerRes,
} from '@express-vue-template/types/api';
import ResBody from '@server/struct/ResBody';
import { Router } from 'express';
import * as promptsController from './controller';

const promptsRouter = Router();

/**
 * 获取提示词列表
 */
promptsRouter.get(GET_PROMPTS_LIST_API, async (req, res) => {
  const data = await promptsController.getPromptsList();

  res.json(
    new ResBody({
      data,
    })
  );
});

/**
 * 更新提示词
 */
promptsRouter.post(POST_PROMPTS_UPDATE_API, async (req, res) => {
  const { id, content, note } = req.body as PickServerReq<
    typeof POST_PROMPTS_UPDATE_API
  >;

  const idValue = typeof id === 'string' ? Number(id) : id;

  if (!Number.isFinite(idValue)) {
    throw new Error('400-提示词 ID 必须为有效数字');
  }

  const data = await promptsController.updatePrompt({
    id: idValue,
    content,
    note,
  });

  res.json(
    new ResBody({
      data: data as PickServerRes<typeof POST_PROMPTS_UPDATE_API>,
    })
  );
});

/**
 * 新增提示词
 */
promptsRouter.post(POST_PROMPTS_CREATE_API, async (req, res) => {
  const { type, content, note } = req.body as PickServerReq<
    typeof POST_PROMPTS_CREATE_API
  >;

  const data = await promptsController.createPrompt(type, content, note);

  res.json(
    new ResBody({
      data: data as PickServerRes<typeof POST_PROMPTS_CREATE_API>,
    })
  );
});

/**
 * 将提示词设为当前类型使用的提示词
 */
promptsRouter.post(POST_PROMPTS_SELECT_API, async (req, res) => {
  const { id } = req.body as PickServerReq<typeof POST_PROMPTS_SELECT_API>;

  const idValue = typeof id === 'string' ? Number(id) : id;

  if (!Number.isFinite(idValue)) {
    throw new Error('400-提示词 ID 必须为有效数字');
  }

  const data = await promptsController.selectPrompt(idValue);

  res.json(
    new ResBody({
      data: data as PickServerRes<typeof POST_PROMPTS_SELECT_API>,
    })
  );
});

export default promptsRouter;
