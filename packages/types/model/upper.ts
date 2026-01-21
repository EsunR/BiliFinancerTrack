import type {
  Model,
  Optional,
} from '@express-vue-template/server/node_modules/sequelize';

export interface UpperAttributes {
  id: number;
  uid: number;
  name: string;
  avatar: string;
  created_at: Date;
}

export interface UpperCreationAttribute
  extends Optional<UpperAttributes, 'id'> {}

export interface UpperInstance
  extends Model<UpperAttributes, UpperCreationAttribute>,
    UpperAttributes {}
