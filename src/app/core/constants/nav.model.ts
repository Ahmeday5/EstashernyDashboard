import { NavIconName } from '../../shared/components/nav-icon/nav-icon.component';
import { BadgeType } from './badge.constants';

export interface NavItem {
  id: string;
  label: string;
  /** Omitted for a group item (one with `children`) — it renders as an accordion toggle, not a link. */
  route?: string;
  icon: NavIconName;
  badge?: string;
  badgeType?: BadgeType;
  allowedRoles?: ReadonlyArray<string>;
  /** When set, this entry renders as a collapsible accordion group instead of a direct link. */
  children?: NavItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}
