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
    video_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
    timestamps: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    part_start_at: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    audio_duration: {
      type: DataTypes.INTEGER,
    },
    model: {
      type: DataTypes.STRING,
    },
    model_output_raw: {
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
