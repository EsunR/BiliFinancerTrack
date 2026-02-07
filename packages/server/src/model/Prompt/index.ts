import { PromptInstance, PromptType } from '@express-vue-template/types/model';
import db from '@server/db';
import { DataTypes, Sequelize } from 'sequelize';

export function createPromptModel(sequelize: Sequelize) {
  const PromptModel = sequelize.define<PromptInstance>('Prompt', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('analysis', 'report'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
    },
    selected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return PromptModel;
}

const promptModel = createPromptModel(db.sequelize);

export default promptModel;
