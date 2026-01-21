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
  video_id: string;
  content: string;
  timestamps: TimestampSegment[];
  part_start_at: number;
  audio_duration: number;
  model: string;
  model_output_raw: string;
  duration: number;
}

export interface TranscriptCreationAttribute
  extends Optional<
    TranscriptAttributes,
    'id' | 'timestamps' | 'model_output_raw' | 'duration'
  > {}

export interface TranscriptInstance
  extends Model<TranscriptAttributes, TranscriptCreationAttribute>,
    TranscriptAttributes {}
