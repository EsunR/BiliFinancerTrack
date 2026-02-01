/**
 * 获取可访问的 B 站图片代理 URL
 */
export function getBiliImageProxyUrl(imageUrl: string): string {
  return `/api/proxy/bili-image?url=${encodeURIComponent(imageUrl)}`;
}
