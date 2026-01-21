import type {
  Model,
  Optional,
} from '@express-vue-template/server/node_modules/sequelize';

export type ModelType = 'text' | 'audio_to_text';

export interface ModelAttributes {
  id: number;
  name: string;
  baseURL: string;
  apiKey: string;
  model: string;
  type: ModelType;
  is_default: boolean;
}

export interface ModelCreationAttribute
  extends Optional<ModelAttributes, 'id' | 'is_default'> {}

export interface ModelInstance
  extends Model<ModelAttributes, ModelCreationAttribute>,
    ModelAttributes {}
