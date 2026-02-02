import type {
  Model,
  Optional,
} from '@express-vue-template/server/node_modules/sequelize';

export interface HoldingAttributes {
  id: number;
  name: string;
  code: string;
  percent: number;
  profit: number;
}

export interface HoldingCreationAttribute
  extends Optional<HoldingAttributes, 'id'> {}

export interface HoldingInstance
  extends Model<HoldingAttributes, HoldingCreationAttribute>,
    HoldingAttributes {}
