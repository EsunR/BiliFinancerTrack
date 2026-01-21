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
    upper_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cover_url: {
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
    publish_at: {
      type: DataTypes.DATE,
    },
    video_type: {
      type: DataTypes.ENUM('video', 'live'),
      defaultValue: 'video',
    },
    status: {
      type: DataTypes.ENUM(
        VideoStatusEnum.DOWNLOADING,
        VideoStatusEnum.PENDING,
        VideoStatusEnum.TRANSCRIBING,
        VideoStatusEnum.ANALYZING,
        VideoStatusEnum.COMPLETED
      ),
      defaultValue: VideoStatusEnum.DOWNLOADING,
    },
    status_failed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return VideoModel;
}

const videoModel = createVideoModel(db.sequelize);

export default videoModel;
