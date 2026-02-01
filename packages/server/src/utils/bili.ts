import { Client } from '@renmu/bili-api';
import { PUBLIC_DIR_PATH } from '@server/config/paths';
import path from 'path';
import fs from 'fs';
import { logger } from './log';
import { autoRetry } from '@express-vue-template/utils';

let biliClient: Client | null = null;

/**
 * 获取 B 站 API 客户端实例
 */
export function getBiliClient() {
  if (biliClient) {
    return biliClient;
  } else {
    biliClient = new Client();
    return biliClient;
  }
}

export function downloadVideo(bvid: string) {
  return new Promise<string>(async (resolve, reject) => {
    const client = getBiliClient();
    const downloadFolder = path.join(PUBLIC_DIR_PATH, 'downloads/videos');
    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder, { recursive: true });
    }
    const videoFilePath = path.join(downloadFolder, `${bvid}.mp4`);
    if (fs.existsSync(videoFilePath)) {
      resolve(videoFilePath);
      return;
    }
    try {
      const task = await client.video.download({
        bvid,
        output: videoFilePath,
      });
      task.on('progress', (p) => {
        logger.debug(
          `视频 ${bvid} 下载中... ${(
            (p?.progress?.progress ?? 0) * 100
          ).toFixed(2)}%`
        );
      });
      task.on('completed', () => {
        resolve(videoFilePath);
      });
      task.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

export function biliApiAutoRetry<T>(fn: () => Promise<T>) {
  return autoRetry(fn, {
    maxTryTimes: 20,
    intervalMs: 250,
    onRetry: () => {
      logger.debug('B 站 API 请求重试中...');
    },
  });
}
