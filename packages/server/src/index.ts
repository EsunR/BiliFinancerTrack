import cors from 'cors';
import express from 'express';
import { logger } from './utils/log';
import { NODE_PORT } from './config';
import { STATIC_DIR_PATH } from './config/paths';
import dbGenerator from './db/db_generator';
import errorHandler from './middleware/errorHandler';
import requestHandler from './middleware/requestHandler';
import mountRoutes from './routers';
import cookieParser from 'cookie-parser';
import scheduler from './scheduler';
import { autoTriggerSync } from './scheduler/autoTrigger';
import { dailyReportsGenerate } from './routers/dailyReports/controller';

const log = logger;

// const app: Koa = new Koa();
const app = express();

// 需要数据库连接可选择接触该行注释
dbGenerator();

// 错误处理
app.use(requestHandler());

// 静态文件服务
app.use(express.static(STATIC_DIR_PATH));

// CORS
app.use(cors());

// 解析 HTTP Body
app.use(express.json());

// 解析 cookie
app.use(cookieParser());

// Router
mountRoutes(app);

// 错误处理
app.use(errorHandler());

// 初始化定时任务
// 每天 12:00 执行
scheduler.registerScheduledTask(
  'autoTriggerSync_12',
  '0 12 * * *',
  autoTriggerSync
);
// 每天 19:00 执行
scheduler.registerScheduledTask(
  'autoTriggerSync_19',
  '0 18 * * *',
  autoTriggerSync
);
// 每天 19:00 自动生成日报
scheduler.registerScheduledTask(
  'dailyReportGenerate_19',
  '0 19 * * *',
  async () => {
    await dailyReportsGenerate();
  }
);

log.info('Scheduled tasks registered');

// Listen
app.listen(NODE_PORT);
log.info(`serve running on port ${NODE_PORT}`);
