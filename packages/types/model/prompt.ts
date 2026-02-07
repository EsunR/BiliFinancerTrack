import type {
  Model,
  Optional,
} from '@express-vue-template/server/node_modules/sequelize';

export type PromptType = 'analysis' | 'report';

export interface PromptAttributes {
  id: number;
  type: PromptType;
  content: string;
  note?: string;
  selected: boolean;
}

export interface PromptCreationAttribute
  extends Optional<PromptAttributes, 'id' | 'selected' | 'note'> {}

export interface PromptInstance
  extends Model<PromptAttributes, PromptCreationAttribute>,
    PromptAttributes {}
