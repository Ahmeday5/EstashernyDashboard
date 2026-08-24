import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../services/auth.service';
import { NavIconComponent } from '../../shared/components/nav-icon/nav-icon.component';
import { NAV_SECTIONS } from '../../core/constants/nav.constants';
import { getBadgeClass, BadgeType } from '../../core/constants/badge.constants';
import { NavItem } from '../../core/constants/nav.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive, NavIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly layout = inject(LayoutService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly currentUrl = signal(this.router.url);
  private readonly currentRole = signal(this.auth.getCurrentRole());
  /** Explicit user overrides, keyed by group id — wins over the active-route auto-expand default either way. */
  private readonly manualOverrides = signal<ReadonlyMap<string, boolean>>(new Map());

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.currentUrl.set(this.router.url));

    this.auth.role$.subscribe(() => this.currentRole.set(this.auth.getCurrentRole()));
  }

  protected readonly visibleSections = computed(() => {
    const role = this.currentRole();
    const filterItems = (items: NavItem[]): NavItem[] =>
      items
        .filter((item) => !item.allowedRoles?.length || (!!role && item.allowedRoles.includes(role)))
        .map((item) => (item.children ? { ...item, children: filterItems(item.children) } : item))
        .filter((item) => !item.children || item.children.length > 0);

    return NAV_SECTIONS.map((section) => ({ ...section, items: filterItems(section.items) })).filter(
      (s) => s.items.length > 0,
    );
  });

  protected getBadgeClass(type?: BadgeType): string {
    return getBadgeClass(type);
  }

  /**
   * A group defaults to expanded when the active route matches one of its children (so navigating
   * there doesn't hide it), but an explicit user click always overrides that default in either
   * direction — otherwise a group whose page is currently open could never be manually collapsed.
   */
  protected isGroupExpanded(item: NavItem): boolean {
    const override = this.manualOverrides().get(item.id);
    if (override !== undefined) return override;
    return !!item.children?.some((child) => this.isChildActive(child));
  }

  protected isChildActive(child: NavItem): boolean {
    if (!child.route) return false;
    const url = this.currentUrl().split('?')[0];
    return url === child.route || url.startsWith(child.route + '/');
  }

  protected toggleGroup(item: NavItem): void {
    const next = !this.isGroupExpanded(item);
    this.manualOverrides.update((map) => {
      const copy = new Map(map);
      copy.set(item.id, next);
      return copy;
    });
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
