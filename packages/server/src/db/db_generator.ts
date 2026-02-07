import db from './index';
import '@server/model/Analysis';
import '@server/model/DailyReport';
import '@server/model/Model';
import '@server/model/Transcript';
import '@server/model/Upper';
import '@server/model/User';
import '@server/model/Video';
import '@server/model/Prompt';
import { setupAssociations } from '@server/model/associations';
import { resumeAllProcessingVideos } from '@server/routers/video/controller';
import promptModel from '@server/model/Prompt';
import {
  DAILY_REPORT_BASE_PROMPT,
  VIDEO_ANALYSIS_BASE_PROMPT,
} from '@server/config/prompts';
import { dbLogger } from '@server/utils/log';

async function setDefaultPromptRecords() {
  const analysisPromptsCount = await promptModel.count({
    where: { type: 'analysis' },
  });
  if (analysisPromptsCount === 0) {
    await promptModel.create({
      type: 'analysis',
      content: VIDEO_ANALYSIS_BASE_PROMPT,
      selected: true,
    });
    dbLogger.info('已创建默认分析提示词');
  }

  const reportPromptsCount = await promptModel.count({
    where: { type: 'report' },
  });
  if (reportPromptsCount === 0) {
    await promptModel.create({
      type: 'report',
      content: DAILY_REPORT_BASE_PROMPT,
      selected: true,
    });
    dbLogger.info('已创建默认日报提示词');
  }
}

export default async function () {
  // 设置模型关联
  setupAssociations();
  await db.sequelize.sync({
    force: process.env.DB_FORCE === 'TRUE' ? true : false,
  });
  await db.connectTest();
  await setDefaultPromptRecords();
  resumeAllProcessingVideos();
}
