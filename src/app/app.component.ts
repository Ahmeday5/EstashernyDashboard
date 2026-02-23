import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { NgwWowService } from 'ngx-wow';
import { HeaderComponent } from './layout/header/header.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Estasheny-dashboard';

  isLoggedIn$: Observable<boolean>;

  private wowService: NgwWowService;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngwWowService: NgwWowService,
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.wowService = this.ngwWowService;
    this.wowService.init();
  }

  ngOnInit() {
    this.authService.isLoggedIn$
      .pipe(takeUntilDestroyed())
      .subscribe((isLoggedIn) => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']);
        }
      });
  }
}
