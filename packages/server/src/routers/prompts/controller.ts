import promptModel from '@server/model/Prompt';
import {
  PromptAttributes,
  PromptType,
} from '@express-vue-template/types/model';

/**
 * 获取提示词列表
 */
export async function getPromptsList() {
  const prompts = await promptModel.findAll({
    order: [['id', 'ASC']],
  });

  return prompts.map((prompt) => prompt.toJSON() as PromptAttributes);
}

/**
 * 更新提示词
 */
export async function updatePrompt(params: {
  id: number;
  content: string;
  note?: string;
}) {
  const { id, content, note } = params;
  const prompt = await promptModel.findByPk(id);

  if (!prompt) {
    throw new Error('404-提示词不存在');
  }

  await prompt.update({
    content,
    note,
  });

  return { success: true };
}

/**
 * 新增提示词
 */
export async function createPrompt(
  type: PromptType,
  content: string,
  note?: string
) {
  await promptModel.create({
    type,
    content,
    note,
    selected: false,
  });

  return { success: true };
}

/**
 * 设为当前类型使用的提示词
 */
export async function selectPrompt(id: number) {
  const prompt = await promptModel.findByPk(id);

  if (!prompt) {
    throw new Error('404-提示词不存在');
  }

  const currentSelected = await promptModel.findOne({
    where: {
      type: prompt.type,
      selected: true,
    },
  });

  if (currentSelected && currentSelected.id !== prompt.id) {
    await currentSelected.update({
      selected: false,
    });
  }

  if (!prompt.selected) {
    await prompt.update({
      selected: true,
    });
  }

  return { success: true };
}
