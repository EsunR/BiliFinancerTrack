import type { Express } from 'express';
import testRouter from './test';
import upperRouter from './upper';
import userRouter from './user';

export default function mountRoutes(app: Express) {
  app.use('/api', testRouter);
  app.use('/api', upperRouter);
  app.use('/api', userRouter);
}
