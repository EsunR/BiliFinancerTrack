import type {
  Model,
  Optional,
} from '@express-vue-template/server/node_modules/sequelize';

export interface DailyReportAttributes {
  id: number;
  reportDate: Date;
  content: string;
  includeVideoIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyReportCreationAttribute
  extends Optional<DailyReportAttributes, 'id'> {}

export interface DailyReportInstance
  extends Model<DailyReportAttributes, DailyReportCreationAttribute>,
    DailyReportAttributes {}
