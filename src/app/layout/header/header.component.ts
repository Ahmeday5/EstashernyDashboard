import { Component, ElementRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  protected readonly layout = inject(LayoutService);

  breadcrumbs: { label: string; url: string }[] = [];
  pageTitle = '';

  userData: any = null;
  username = 'ادمن';
  roleLabel = '';
  userImage = '/assets/img/logo-login.png';

  protected readonly userMenuOpen = signal(false);

  private static readonly ROLE_LABELS: Record<string, string> = {
    Admin: 'مدير النظام',
    Editor: 'محرر',
    Sales: 'مبيعات',
    Marketing: 'تسويق',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        map((route) => route.snapshot),
      )
      .subscribe((route) => {
        this.breadcrumbs = this.getBreadcrumbs(route);
        this.pageTitle = this.breadcrumbs[this.breadcrumbs.length - 1]?.label || '';
      });

    this.loadUserData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.userMenuOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.userMenuOpen.set(false);
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen.set(!this.userMenuOpen());
  }

  private getBreadcrumbs(
    route: any,
    url: string = '',
    breadcrumbs: { label: string; url: string }[] = [],
  ): { label: string; url: string }[] {
    const routeData = route.data;
    const routeUrl = route.url.map((segment: { path: any }) => segment.path).join('/');
    const label = routeData?.breadcrumb || '';

    if (label) {
      breadcrumbs.push({ label, url: url + '/' + routeUrl });
    }

    if (route.firstChild) {
      return this.getBreadcrumbs(route.firstChild, url + '/' + routeUrl, breadcrumbs);
    }

    return breadcrumbs;
  }

  loadUserData(): void {
    this.userData = this.authService.getUserData();
    const role = this.authService.getCurrentRole();
    this.roleLabel = (role && HeaderComponent.ROLE_LABELS[role]) || role || '';

    if (this.userData) {
      this.username = `${this.userData.firstName}`;
      this.userImage =
        this.userData.picture && this.userData.picture !== 'N/A'
          ? this.userData.picture
          : '/assets/img/logo-login.png';
    }
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
