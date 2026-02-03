import {
  GET_DAILYREPORTS_LIST_API,
  GET_DAILYREPORTS_MONTH_API,
  POST_DAILYREPORTS_GENERATE_API,
  PickServerRes,
} from '@express-vue-template/types/api';
import { DAILY_REPORT_BASE_PROMPT } from '@server/config/prompts';
import analysisModel from '@server/model/Analysis';
import dailyReportModel from '@server/model/DailyReport';
import holdingModel from '@server/model/Holding';
import upperModel from '@server/model/Upper';
import videoModel from '@server/model/Video';
import { logger } from '@server/utils/log';
import { deepSeekV3Research } from '@server/utils/llm';
import { Op } from 'sequelize';

const dailyReportProcessingSet = new Set<number>();

/**
 * 获取目标日期的起止范围
 */
function getDateRange(date?: string) {
  const dateStr = date ?? new Date().toISOString().slice(0, 10);
  const startDate = new Date(dateStr);
  const endDate = new Date(dateStr);
  endDate.setDate(endDate.getDate() + 1);
  return {
    startDate,
    endDate,
    reportDate: startDate,
  };
}

/**
 * 解析视频 ID 列表
 */
async function resolveVideoIds(
  date?: string,
  videoIds?: number[]
): Promise<number[]> {
  if (videoIds?.length) {
    return videoIds;
  }

  const { startDate, endDate } = getDateRange(date);

  const videos = await videoModel.findAll({
    where: {
      publishAt: {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      },
    },
    attributes: ['id'],
  });

  return videos.map((v) => v.id);
}

/**
 * 生成日报模型的用户输入
 */
async function buildReportsPrompt(reports: string[]) {
  const holdings = await holdingModel.findAll({
    order: [['id', 'ASC']],
  });

  let holdingsText = '未提供';
  if (holdings.length > 0) {
    holdingsText = holdings
      .map((holding) => {
        const profitText =
          holding.profit > 0
            ? `盈利 ${(holding.profit * 100).toFixed(2)}%`
            : holding.profit < 0
            ? `亏损 ${Math.abs(holding.profit * 100).toFixed(2)}%`
            : '持平';
        return `- ${holding.name}（${holding.code}）：占比 ${(
          holding.percent * 100
        ).toFixed(2)}%，${profitText}`;
      })
      .join('\n');
  }

  return `【股市分析报告】\n${reports.join(
    '\n---\n'
  )}\n\n【用户持仓状态】\n${holdingsText}`;
}

/**
 * 构建单个视频的分析报告文本
 */
async function buildAnalysisReport(videoId: number): Promise<string | null> {
  const video = await videoModel.findByPk(videoId);
  if (!video) {
    return null;
  }

  const upper = await upperModel.findByPk(video.upperId);

  const analysis = await analysisModel.findOne({
    where: { videoId },
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  if (!analysis?.content) {
    return null;
  }

  const authorName = upper?.name ?? '未知作者';

  return [
    `作者：${authorName}`,
    `视频标题：${video.title}`,
    `视频ID：${video.id}`,
    '分析内容：',
    '```markdown',
    analysis.content,
    '```',
  ].join('\n');
}

/**
 * 触发日报生成任务
 */
export async function dailyReportsGenerate(
  date?: string,
  videoIds?: number[]
): Promise<PickServerRes<typeof POST_DAILYREPORTS_GENERATE_API>> {
  const { reportDate } = getDateRange(date);

  if (dailyReportProcessingSet.has(reportDate.getTime())) {
    throw new Error('409-该日期的日报正在生成中，请勿重复触发');
  }

  const resolvedVideoIds = await resolveVideoIds(date, videoIds);
  logger.debug(
    `开始生成 ${reportDate
      .toISOString()
      .slice(0, 10)} 日报，涉及视频ID：${resolvedVideoIds.join(', ')}`
  );

  const task = async () => {
    if (!resolvedVideoIds.length) {
      throw new Error('404-未找到可用于生成日报的视频');
    }

    const reports = (
      await Promise.all(resolvedVideoIds.map((id) => buildAnalysisReport(id)))
    ).filter(Boolean) as string[];

    if (!reports.length) {
      throw new Error('404-未找到可用于生成日报的分析报告');
    }

    logger.debug(
      `正在调用 LLM 生成日报内容，包含 ${reports.length} 篇分析报告`
    );
    const chatResponse = await deepSeekV3Research.chat([
      {
        role: 'system',
        content: DAILY_REPORT_BASE_PROMPT,
      },
      {
        role: 'user',
        content: await buildReportsPrompt(reports),
      },
    ]);
    logger.debug('LLM 日报内容生成完成');

    if (!chatResponse || !chatResponse?.content) {
      throw new Error('500-日报生成失败');
    }

    await dailyReportModel.create({
      reportDate,
      content: chatResponse.content,
      includeVideoIds: resolvedVideoIds.map((id) => String(id)),
    });
  };

  dailyReportProcessingSet.add(reportDate.getTime());
  task()
    .catch((err) => {
      logger.error(`日报生成失败：${err.message}`);
    })
    .finally(() => {
      dailyReportProcessingSet.delete(reportDate.getTime());
    });

  return {} as PickServerRes<typeof POST_DAILYREPORTS_GENERATE_API>;
}

/**
 * 获取日报列表
 */
export async function getDailyReportsList(date?: string) {
  const whereCondition = date
    ? (() => {
        const { startDate, endDate } = getDateRange(date);
        return {
          reportDate: {
            [Op.gte]: startDate,
            [Op.lt]: endDate,
          },
        };
      })()
    : undefined;

  const reports = await dailyReportModel.findAll({
    where: whereCondition,
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  return {
    list: reports.map((report) => ({
      id: report.id,
      reportDate: report.reportDate,
      content: report.content,
      includeVideoIds: report.includeVideoIds,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    })),
    processing: dailyReportProcessingSet.has(
      getDateRange(date).reportDate.getTime()
    ),
  } as PickServerRes<typeof GET_DAILYREPORTS_LIST_API>;
}

/**
 * 获取日报的月视图
 */
export async function getDailyReportsMonth(
  year: number,
  month: number
): Promise<PickServerRes<typeof GET_DAILYREPORTS_MONTH_API>> {
  // 构造月份的起止日期
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // 计算该月有多少天
  const daysInMonth = new Date(year, month, 0).getDate();

  // 查询该月所有日报
  const reports = await dailyReportModel.findAll({
    where: {
      reportDate: {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      },
    },
    attributes: ['reportDate'],
  });

  // 查询该月所有视频
  const videos = await videoModel.findAll({
    where: {
      publishAt: {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      },
    },
    attributes: ['publishAt'],
  });

  // 按日份统计日报数量
  const reportCountMap = new Map<number, number>();
  reports.forEach((report) => {
    const day = new Date(report.reportDate).getDate();
    reportCountMap.set(day, (reportCountMap.get(day) || 0) + 1);
  });

  // 按日份统计视频数量
  const videoCountMap = new Map<number, number>();
  videos.forEach((video) => {
    const day = new Date(video.publishAt).getDate();
    videoCountMap.set(day, (videoCountMap.get(day) || 0) + 1);
  });

  // 生成该月所有日期的数据
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      day,
      reportCount: reportCountMap.get(day) || 0,
      videoCount: videoCountMap.get(day) || 0,
    };
  });
}
