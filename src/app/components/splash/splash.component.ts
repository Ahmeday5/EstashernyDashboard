import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [],
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.scss',
})
export class SplashComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService) {}
  ngOnInit(): void {
    // التحقق من حالة تسجيل الدخول
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.router.navigate(['/dashboard']);
      } else {
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
  }

}
