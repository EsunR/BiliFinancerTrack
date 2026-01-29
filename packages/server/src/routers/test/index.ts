import {
  GET_TEST_ERROR_API,
  GET_TEST_SUCCESS_API,
} from '@express-vue-template/types/api';
import { Router } from 'express';
import { Client } from '@renmu/bili-api';

const testRouter = Router();

const biliClient = new Client();

testRouter.get(GET_TEST_SUCCESS_API, async (req, res) => {
  res.json({
    data: { time: new Date() },
  });
});

testRouter.get(GET_TEST_ERROR_API, async (req, res) => {
  // express 5 开始，在 async 函数中抛出错误会被自动捕获，不需要再调用 next
  throw new Error('500-服务器接口错误测试');
});

testRouter.get('/test/bili', async (req, res) => {
  const data = await biliClient.user.getVideos({
    mid: 526143269,
  });

  // const data = await biliClient.video.playurl({
  //   cid: 35290877171,
  //   aid: 115867111130186,
  //   bvid: 'BV1DaruB2ELU',
  // });

  // const data = await biliClient.user.getUserInfo(526143269);
  res.json({
    data,
  });
});

export default testRouter;
