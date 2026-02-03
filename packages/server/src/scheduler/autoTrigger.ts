import dayjs from 'dayjs';

/**
 * 获取下一次执行时间（用于调试和监控）
 */
export function getNextExecutionTimes(): {
  time: string;
  description: string;
}[] {
  const now = dayjs();
  const times = [];

  // 12:00
  let noon = dayjs().hour(12).minute(0).second(0);
  if (noon.isBefore(now)) {
    noon = noon.add(1, 'day');
  }
  times.push({
    time: noon.format('YYYY-MM-DD HH:mm:ss'),
    description: 'Daily 12:00 sync',
  });

  // 19:00
  let evening = dayjs().hour(19).minute(0).second(0);
  if (evening.isBefore(now)) {
    evening = evening.add(1, 'day');
  }
  times.push({
    time: evening.format('YYYY-MM-DD HH:mm:ss'),
    description: 'Daily 19:00 sync',
  });

  return times.sort((a, b) => dayjs(a.time).diff(dayjs(b.time)));
}
