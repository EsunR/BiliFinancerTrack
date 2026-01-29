import {
  VideoInstance,
  VideoStatusEnum,
  VideoType,
} from '@express-vue-template/types/model';
import db from '@server/db';
import { DataTypes, Sequelize } from 'sequelize';

export function createVideoModel(sequelize: Sequelize) {
  const VideoModel = sequelize.define<VideoInstance>('Video', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    upperId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    coverUrl: {
      type: DataTypes.STRING,
    },
    bvid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
    publishAt: {
      type: DataTypes.DATE,
    },
    videoType: {
      type: DataTypes.ENUM('video', 'live'),
      defaultValue: 'video',
    },
    status: {
      type: DataTypes.ENUM(
        VideoStatusEnum.PENDING,
        VideoStatusEnum.DOWNLOADED,
        VideoStatusEnum.AUDIO_EXTRACTED,
        VideoStatusEnum.TRANSCRIBED
      ),
      defaultValue: VideoStatusEnum.PENDING,
    },
    statusFailed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return VideoModel;
}

const videoModel = createVideoModel(db.sequelize);

export default videoModel;
