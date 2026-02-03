import db from './index';
import '@server/model/Analysis';
import '@server/model/DailyReport';
import '@server/model/Model';
import '@server/model/Transcript';
import '@server/model/Upper';
import '@server/model/User';
import '@server/model/Video';
import { setupAssociations } from '@server/model/associations';
import { resumeAllProcessingVideos } from '@server/routers/video/controller';

export default async function () {
  // 设置模型关联
  setupAssociations();
  await db.sequelize.sync({
    force: process.env.DB_FORCE === 'TRUE' ? true : false,
  });
  await db.connectTest();
  resumeAllProcessingVideos();
}
