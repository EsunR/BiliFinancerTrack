import type {
  Model,
  Optional,
} from '@express-vue-template/server/node_modules/sequelize';

export enum VideoStatusEnum {
  /** 待处理 */
  PENDING = 'pending',
  /** 下载中 */
  DOWNLOADING = 'downloading',
  /** 下载完成 */
  DOWNLOADED = 'downloaded',
  /** 转写中 */
  TRANSCRIBING = 'transcribing',
  /** AI 分析中 */
  ANALYZING = 'analyzing',
  /** 分析完成 */
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
