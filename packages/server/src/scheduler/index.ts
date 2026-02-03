import cron from 'node-cron';
import { logger } from '@server/utils/log';

const log = logger;

interface ScheduledTask {
  id: string;
  task: cron.ScheduledTask;
}

const tasks: Map<string, ScheduledTask> = new Map();

/**
 * 注册一个定时任务
 * @param id 任务唯一标识
 * @param cronExpression cron 表达式
 * @param callback 回调函数
 */
export function registerScheduledTask(
  id: string,
  cronExpression: string,
  callback: Function
): void {
  if (tasks.has(id)) {
    log.warn(`Task ${id} already exists`);
    return;
  }

  const task = cron.schedule(cronExpression, async () => {
    try {
      log.info(`Starting task: ${id}`);
      await callback();
      log.info(`Task completed: ${id}`);
    } catch (error) {
      log.error(`Task ${id} failed:`, error);
    }
  });

  tasks.set(id, { id, task });
  log.info(`Task registered: ${id} with cron: ${cronExpression}`);
}

/**
 * 停止指定的定时任务
 * @param id 任务唯一标识
 */
export function stopScheduledTask(id: string): void {
  const scheduled = tasks.get(id);
  if (scheduled) {
    scheduled.task.stop();
    tasks.delete(id);
    log.info(`Task stopped: ${id}`);
  }
}

/**
 * 停止所有定时任务
 */
export function stopAllScheduledTasks(): void {
  tasks.forEach((scheduled) => {
    scheduled.task.stop();
  });
  tasks.clear();
  log.info('All tasks stopped');
}

/**
 * 获取所有已注册的任务
 */
export function getScheduledTasks(): ScheduledTask[] {
  return Array.from(tasks.values());
}

export default {
  registerScheduledTask,
  stopScheduledTask,
  stopAllScheduledTasks,
  getScheduledTasks,
};
