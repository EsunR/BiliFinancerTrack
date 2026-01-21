import { ModelInstance } from '@express-vue-template/types/model';
import db from '@server/db';
import { DataTypes, Sequelize } from 'sequelize';

export function createModelModel(sequelize: Sequelize) {
  const ModelModel = sequelize.define<ModelInstance>('Model', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    baseURL: {
      type: DataTypes.STRING,
    },
    apiKey: {
      type: DataTypes.STRING,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('text', 'audio_to_text'),
      allowNull: false,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return ModelModel;
}

const modelModel = createModelModel(db.sequelize);

export default modelModel;
