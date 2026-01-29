import { AnalysisInstance } from '@express-vue-template/types/model';
import db from '@server/db';
import { DataTypes, Sequelize } from 'sequelize';

export function createAnalysisModel(sequelize: Sequelize) {
  const AnalysisModel = sequelize.define<AnalysisInstance>('Analysis', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    videoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    promptVersion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
    model: {
      type: DataTypes.STRING,
    },
  });

  return AnalysisModel;
}

const analysisModel = createAnalysisModel(db.sequelize);

export default analysisModel;
