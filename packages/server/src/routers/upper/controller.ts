/**
 * 选择第一个非空字符串
 */
export function pickFirstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

/**
 * 将时长转换为秒数
 */
export function parseDurationToSeconds(duration?: number | string | null) {
  if (typeof duration === 'number' && Number.isFinite(duration)) {
    return Math.floor(duration);
  }
  if (typeof duration !== 'string') {
    return 0;
  }
  const parts = duration.split(':').map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) {
    return 0;
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] ?? 0;
}

/**
 * 解析发布时间为 Date
 */
export function resolvePublishAt(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value > 1e12 ? value : value * 1000);
  }
  if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isFinite(num)) {
      return new Date(num > 1e12 ? num : num * 1000);
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

/**
 * 解析视频时长字符串（如 "05:58"）为秒数
 */
export function parseDuration(durationStr: string): number {
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}
