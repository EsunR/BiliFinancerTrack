import holdingModel from '@server/model/Holding';
import { HoldingAttributes } from '@express-vue-template/types/model';

/**
 * 获取资产持仓列表
 */
export async function getHoldingsList() {
  const holdings = await holdingModel.findAll({
    order: [['id', 'ASC']],
  });

  return holdings.map((holding) => holding.toJSON() as HoldingAttributes);
}

/**
 * 更新资产持仓
 */
export async function updateHoldings(
  holdings: Array<
    Pick<HoldingAttributes, 'name' | 'code' | 'percent' | 'profit'>
  >
) {
  // 使用事务来保证数据一致性
  const transaction = await holdingModel.sequelize!.transaction();

  try {
    // 删除所有现有的持仓记录
    await holdingModel.destroy({
      where: {},
      transaction,
    });

    // 插入新的持仓记录
    await holdingModel.bulkCreate(holdings, {
      transaction,
    });

    // 提交事务
    await transaction.commit();

    return { success: true };
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    throw new Error(`500-更新资产持仓失败: ${error}`);
  }
}
