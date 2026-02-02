import type { Express } from 'express';
import upperRouter from './upper';
import videoRouter from './video';
import proxyRouter from './proxy';

export default function mountRoutes(app: Express) {
  app.use('/api', upperRouter);
  app.use('/api', videoRouter);
  app.use('/api', proxyRouter);
}
