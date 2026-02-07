import type { Express } from 'express';
import dailyReportsRouter from './dailyReports';
import holdingsRouter from './holdings';
import promptsRouter from './prompts';
import upperRouter from './upper';
import videoRouter from './video';
import proxyRouter from './proxy';

export default function mountRoutes(app: Express) {
  app.use('/api', upperRouter);
  app.use('/api', videoRouter);
  app.use('/api', proxyRouter);
  app.use('/api', dailyReportsRouter);
  app.use('/api', holdingsRouter);
  app.use('/api', promptsRouter);
}
