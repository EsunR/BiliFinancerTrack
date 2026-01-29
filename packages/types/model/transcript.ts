import type {
  Model,
  Optional,
} from '@express-vue-template/server/node_modules/sequelize';

export interface TimestampSegment {
  start: number;
  end: number;
  content: string;
}

export interface TranscriptAttributes {
  id: number;
  videoId: number;
  content: string;
  timestamps: TimestampSegment[];
  partStartAt: number;
  model: string;
  modelOutputRaw: string;
  duration: number;
}

export interface TranscriptCreationAttribute
  extends Optional<
    TranscriptAttributes,
    'id' | 'timestamps' | 'modelOutputRaw' | 'duration'
  > {}

export interface TranscriptInstance
  extends Model<TranscriptAttributes, TranscriptCreationAttribute>,
    TranscriptAttributes {}
