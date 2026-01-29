import { TranscriptInstance } from '@express-vue-template/types/model';
import db from '@server/db';
import { DataTypes, Sequelize } from 'sequelize';

export function createTranscriptModel(sequelize: Sequelize) {
  const TranscriptModel = sequelize.define<TranscriptInstance>('Transcript', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    videoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
    timestamps: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    partStartAt: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    model: {
      type: DataTypes.STRING,
    },
    modelOutputRaw: {
      type: DataTypes.TEXT,
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return TranscriptModel;
}

const transcriptModel = createTranscriptModel(db.sequelize);

export default transcriptModel;
