import {Role} from '@common/auth/role';
import {MetaTag} from '@common/seo/meta-tag';

export interface BaseBackendBootstrapData {
  csrf_token?: string;
  guest_role: Role | null;
  default_meta_tags: MetaTag[];
  show_cookie_notice?: boolean;
  rendered_ssr?: boolean;
}
