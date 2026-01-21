import { UpperInstance } from '@express-vue-template/types/model';
import db from '@server/db';
import { DataTypes, Sequelize } from 'sequelize';

export function createUpperModel(sequelize: Sequelize) {
  const UpperModel = sequelize.define<UpperInstance>('Upper', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return UpperModel;
}

const upperModel = createUpperModel(db.sequelize);

export default upperModel;
