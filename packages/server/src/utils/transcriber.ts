import fs from 'fs';
import { OpenAI } from 'openai';
import * as undici from 'undici';
import { loadEnv } from './env';

export interface AudioTextInfo {
  raw: string;
  text: string;
  duration: number;
  segments: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
}

abstract class Transcriber {
  abstract audio2Text(audioPath: string): Promise<AudioTextInfo>;
}

let proxyAgent = undefined;

if (process.env.HTTP_PROXY || process.env.http_proxy) {
  proxyAgent = new undici.ProxyAgent(
    process.env.HTTP_PROXY || process.env.http_proxy || ''
  );
}

export class GroqWhisper extends Transcriber {
  private _groq: OpenAI;

  constructor(option: { sk: string }) {
    super();
    this._groq = new OpenAI({
      apiKey: option.sk,
      baseURL: 'https://api.groq.com/openai/v1',
      fetchOptions: {
        // @ts-ignore
        dispatcher: proxyAgent,
      },
    });
  }

  async audio2Text(audioPath: string) {
    const transcription = await this._groq.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-large-v3-turbo',
      prompt: 'Specify context or spelling',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
      language: 'zh',
      temperature: 0.0,
    });
    return {
      raw: JSON.stringify(transcription),
      text: transcription.text,
      duration: (transcription as any).duration,
      segments: (transcription as any).segments.map((seg: any) => ({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        text: seg.text,
      })),
    } as AudioTextInfo;
  }
}

export const groqWhisper = new GroqWhisper({
  sk: loadEnv('GROQ_SK'),
});
