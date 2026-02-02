import { HoldingInstance } from '@express-vue-template/types/model';
import db from '@server/db';
import { DataTypes, Sequelize } from 'sequelize';

export function createHoldingModel(sequelize: Sequelize) {
  const HoldingModel = sequelize.define<HoldingInstance>('Holding', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '资产名称',
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '资产代码',
    },
    percent: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: '资产占比，0~1 的小数',
    },
    profit: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: '盈亏状态，数值为 -1~1 之间的小数，负数表示亏损，正数表示盈利',
      validate: {
        min: -1,
        max: 1,
      },
    },
  });

  return HoldingModel;
}

const holdingModel = createHoldingModel(db.sequelize);

export default holdingModel;
