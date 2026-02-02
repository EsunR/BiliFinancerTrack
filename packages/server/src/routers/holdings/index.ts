import {
  GET_HOLDINGS_LIST_API,
  POST_HOLDINGS_UPDATE_API,
  PickServerReq,
  PickServerRes,
} from '@express-vue-template/types/api';
import ResBody from '@server/struct/ResBody';
import { Router } from 'express';
import * as holdingsController from './controller';

const holdingsRouter = Router();

/**
 * 获取资产持仓列表
 */
holdingsRouter.get(GET_HOLDINGS_LIST_API, async (req, res) => {
  const data = await holdingsController.getHoldingsList();

  res.json(
    new ResBody({
      data,
    })
  );
});

/**
 * 更新资产持仓
 */
holdingsRouter.post(POST_HOLDINGS_UPDATE_API, async (req, res) => {
  const { holdings } = req.body as PickServerReq<
    typeof POST_HOLDINGS_UPDATE_API
  >;

  const data = await holdingsController.updateHoldings(holdings);

  res.json(
    new ResBody({
      data: data as PickServerRes<typeof POST_HOLDINGS_UPDATE_API>,
    })
  );
});

export default holdingsRouter;
