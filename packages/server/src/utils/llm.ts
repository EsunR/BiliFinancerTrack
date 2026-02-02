import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';
import dotenv from 'dotenv';

dotenv.config();

export class LLM {
  _openai: OpenAI;
  _model: string;
  constructor(options: { apiKey?: string; baseURL?: string; model: string }) {
    const {
      apiKey = process.env.LLM_API_KEY,
      baseURL = process.env.LLM_BASE_URL,
      model,
    } = options || {};
    this._model = model;
    this._openai = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  async chat(messages: Array<ChatCompletionMessageParam>) {
    if (!(messages instanceof Array)) {
      throw new Error('messages 必须是数组');
    }
    const completion = await this._openai.chat.completions.create({
      messages,
      model: this._model,
      reasoning_effort: 'medium',
    });
    return completion.choices[0]?.message ?? '';
  }
}

export const deepSeekV3Research = new LLM({
  model: 'deepseek-reasoner',
});
