import type {
  Model,
  Optional,
} from '@express-vue-template/server/node_modules/sequelize';

export enum VideoStatusEnum {
  DOWNLOADING = 'downloading',
  PENDING = 'pending',
  TRANSCRIBING = 'transcribing',
  ANALYZING = 'analyzing',
  COMPLETED = 'completed',
}

export type VideoType = 'video' | 'live';

export interface VideoAttributes {
  id: number;
  upper_id: number;
  cover_url: string;
  bvid: string;
  title: string;
  duration: number;
  publish_at: Date;
  video_type: VideoType;
  status: VideoStatusEnum;
  status_failed: boolean;
}

export interface VideoCreationAttribute
  extends Optional<VideoAttributes, 'id' | 'status_failed'> {}

export interface VideoInstance
  extends Model<VideoAttributes, VideoCreationAttribute>,
    VideoAttributes {}
