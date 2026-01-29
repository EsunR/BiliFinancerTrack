import { Client } from '@renmu/bili-api';

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
