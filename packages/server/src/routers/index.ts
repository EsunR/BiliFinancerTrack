import type { Express } from 'express';
import testRouter from './test';
import upperRouter from './upper';
import userRouter from './user';
import videoRouter from './video';

export default function mountRoutes(app: Express) {
  app.use('/api', testRouter);
  app.use('/api', upperRouter);
  app.use('/api', userRouter);
  app.use('/api', videoRouter);
}
