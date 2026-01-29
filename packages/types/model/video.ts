import type {
  Model,
  Optional,
} from '@express-vue-template/server/node_modules/sequelize';

export enum VideoStatusEnum {
  /** 待处理 */
  PENDING = 'pending',
  /** 下载完成 */
  DOWNLOADED = 'downloaded',
  /** 音频分离完成 */
  AUDIO_EXTRACTED = 'audio_extracted',
  /** 转写完成 */
  TRANSCRIBED = 'transcribed',
}

export type VideoType = 'video' | 'live';

export interface VideoAttributes {
  id: number;
  upperId: number;
  coverUrl: string;
  bvid: string;
  title: string;
  duration: number;
  publishAt: Date;
  videoType: VideoType;
  status: VideoStatusEnum;
  statusFailed: boolean;
}

export interface VideoCreationAttribute
  extends Optional<VideoAttributes, 'id' | 'statusFailed'> {}

export interface VideoInstance
  extends Model<VideoAttributes, VideoCreationAttribute>,
    VideoAttributes {}
