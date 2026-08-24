import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type NavIconName =
  | 'home'
  | 'doctor'
  | 'doctor-list'
  | 'doctor-add'
  | 'users'
  | 'user-add'
  | 'reports'
  | 'discount'
  | 'specialities'
  | 'bell'
  | 'patients'
  | 'megaphone'
  | 'shield'
  | 'logout';

const PATHS: Record<NavIconName, string> = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  doctor: '<circle cx="12" cy="7" r="3.2"/><path d="M4.5 21c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5"/>',
  'doctor-list': '<rect x="3.5" y="4" width="17" height="16" rx="2.2"/><path d="M7.5 9h9M7.5 13h9M7.5 17h5.5"/>',
  'doctor-add': '<circle cx="10" cy="8" r="3"/><path d="M3.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6"/><path d="M18 8v4M16 10h4"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 13.2c2.4.3 4.3 2.3 4.5 5"/>',
  'user-add': '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M18 8v4M16 10h4"/>',
  reports: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  discount: '<circle cx="7.5" cy="7.5" r="2.2"/><circle cx="16.5" cy="16.5" r="2.2"/><path d="M18 6 6 18"/>',
  specialities: '<path d="M9 3v6.5a3 3 0 0 0 6 0V3"/><path d="M6.5 3h5M12.5 3h5"/><circle cx="6" cy="18" r="3"/><path d="M6 15v-3.5"/>',
  bell: '<path d="M6 10a6 6 0 1 1 12 0c0 3.2 1 5 2 6.5H4c1-1.5 2-3.3 2-6.5Z"/><path d="M9.5 19.5a2.5 2.5 0 0 0 5 0"/>',
  patients: '<circle cx="8.5" cy="8" r="3"/><path d="M2.5 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16.5 4.5 19 7l4-4"/>',
  megaphone: '<path d="M3 10v4h3l6 4V6l-6 4H3Z"/><path d="M17 9.5a3.5 3.5 0 0 1 0 5"/><path d="M19.5 7a7 7 0 0 1 0 10"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"/><path d="M9 12l2 2 4-4.5"/>',
  logout: '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="M15 16l5-4-5-4"/><path d="M20 12H9"/>',
};

@Component({
  selector: 'app-nav-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.9"
      stroke-linecap="round"
      stroke-linejoin="round"
      [innerHTML]="markup"
    ></svg>
  `,
})
export class NavIconComponent {
  @Input() name: NavIconName = 'home';
  @Input() size = 18;

  constructor(private readonly sanitizer: DomSanitizer) {}

  get markup(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(PATHS[this.name] ?? PATHS['home']);
  }
}
