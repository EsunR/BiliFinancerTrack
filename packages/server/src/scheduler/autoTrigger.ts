import dayjs from 'dayjs';
import { logger } from '@server/utils/log';
import upperModel from '@server/model/Upper';
import videoModel from '@server/model/Video';
import analysisModel from '@server/model/Analysis';
import * as upperController from '@server/routers/upper/controller';
import * as videoController from '@server/routers/video/controller';

const log = logger;

/**
 * 自动触发机制：
 * 1. 遍历所有 UP 主
 * 2. 同步每个 UP 主的视频
 * 3. 对当日新发布且新增的视频执行 AI 分析
 */
export async function autoTriggerSync(): Promise<void> {
  try {
    log.info('Starting auto trigger sync...');

    // 获取所有 UP 主
    const uppers = await upperModel.findAll();
    log.info(`Found ${uppers.length} uppers to sync`);

    const today = dayjs().startOf('day');
    const syncResults: {
      upperId: number;
      syncCount: number;
      analyzedCount: number;
    }[] = [];

    // 遍历每个 UP 主
    for (const upper of uppers) {
      try {
        log.info(`Syncing videos for upper: ${upper.name} (id: ${upper.id})`);

        // 同步该 UP 主的视频
        const syncResult = await upperController.postUppersSyncVideos(upper.id);
        log.info(
          `Synced ${syncResult.syncCount} new videos for upper: ${upper.name}`
        );

        // 获取当日新增的视频
        const todayNewVideos = await videoModel.findAll({
          where: {
            upperId: upper.id,
            publishAt: {
              [require('sequelize').Op.gte]: today.toDate(),
              [require('sequelize').Op.lt]: today.add(1, 'day').toDate(),
            },
          },
          order: [['publishAt', 'DESC']],
        });

        log.info(
          `Found ${todayNewVideos.length} videos published today for upper: ${upper.name}`
        );

        // 对每个当日新发布的视频执行 AI 分析
        let analyzedCount = 0;
        for (const video of todayNewVideos) {
          try {
            // 检查是否已有分析记录
            const existingAnalysis = await analysisModel.findOne({
              where: { videoId: video.id },
            });

            if (existingAnalysis) {
              log.info(
                `Video ${video.title} (id: ${video.id}) already has analysis record, skipping...`
              );
              continue;
            }

            log.info(`Analyzing video: ${video.title} (id: ${video.id})`);
            await videoController.postVideosAnalyze(video.id);
            analyzedCount++;
            log.info(`Successfully analyzed video: ${video.title}`);
          } catch (error) {
            log.error(
              `Failed to analyze video ${video.title} (id: ${video.id}):`,
              error
            );
            // 继续处理下一个视频，不中断流程
          }
        }

        syncResults.push({
          upperId: upper.id,
          syncCount: syncResult.syncCount,
          analyzedCount,
        });
      } catch (error) {
        log.error(
          `Failed to sync upper ${upper.name} (id: ${upper.id}):`,
          error
        );
        // 继续处理下一个 UP 主，不中断流程
      }
    }

    log.info('Auto trigger sync completed');
    log.info(`Summary: ${JSON.stringify(syncResults, null, 2)}`);
  } catch (error) {
    log.error('Auto trigger sync failed:', error);
  }
}

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
