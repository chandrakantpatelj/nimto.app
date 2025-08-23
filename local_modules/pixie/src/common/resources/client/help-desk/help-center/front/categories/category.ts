import {Article} from '@common/help-desk/help-center/front/articles/article';
import {Omit} from 'utility-types';

export const CATEGORY_MODEL = 'category';

export interface Category {
  id: number;
  name: string;
  description?: string;
  position: number;
  hidden: boolean;
  created_at?: string;
  updated_at?: string;
  sections?: Section[];
  sections_count?: number;
  articles_count?: number;
  image?: string;
  is_section: false;
  visible_to_role?: number;
  managed_by_role?: number;
  model_type: typeof CATEGORY_MODEL;
}

export interface Section extends Omit<Category, 'children' | 'is_section'> {
  parent_id?: number;
  parent?: Category;
  articles?: Article[];
  is_section: true;
}
