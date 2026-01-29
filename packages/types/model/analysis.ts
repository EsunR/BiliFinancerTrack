import type {
  Model,
  Optional,
} from '@express-vue-template/server/node_modules/sequelize';

export interface AnalysisAttributes {
  id: number;
  videoId: string;
  promptVersion: string;
  content: string;
  model: string;
}

export interface AnalysisCreationAttribute
  extends Optional<AnalysisAttributes, 'id'> {}

export interface AnalysisInstance
  extends Model<AnalysisAttributes, AnalysisCreationAttribute>,
    AnalysisAttributes {}
