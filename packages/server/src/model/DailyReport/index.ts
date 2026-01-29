import { DailyReportInstance } from '@express-vue-template/types/model';
import db from '@server/db';
import { DataTypes, Sequelize } from 'sequelize';

export function createDailyReportModel(sequelize: Sequelize) {
  const DailyReportModel = sequelize.define<DailyReportInstance>(
    'DailyReport',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      reportDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
      },
      includeVideoIds: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
    }
  );

  return DailyReportModel;
}

const dailyReportModel = createDailyReportModel(db.sequelize);

export default dailyReportModel;
