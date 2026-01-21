import type {
  Model,
  Optional,
} from '@express-vue-template/server/node_modules/sequelize';

export interface DailyReportAttributes {
  id: number;
  report_date: Date;
  content: string;
  include_video_ids: string[];
}

export interface DailyReportCreationAttribute
  extends Optional<DailyReportAttributes, 'id'> {}

export interface DailyReportInstance
  extends Model<DailyReportAttributes, DailyReportCreationAttribute>,
    DailyReportAttributes {}
