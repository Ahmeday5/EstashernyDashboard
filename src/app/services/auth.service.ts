import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  picture: string;
  nationalID: string;
  roles: string[];
  token: string | null;
  rememberMe?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(
    !!localStorage.getItem('token'),
  );

  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private roleSubject = new BehaviorSubject<string[] | null>(
    this.getUserData()?.roles || null,
  );
  public role$ = this.roleSubject.asObservable();

  private userData: UserData | null = null;

  constructor() {
    this.loadUserData();
  }

  private loadUserData(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        this.userData = JSON.parse(userData) as UserData;

        if (this.userData?.roles) {
          this.roleSubject.next(this.userData.roles);
          this.isLoggedInSubject.next(true);
        }
      } catch (error) {
        console.error('خطأ في تحليل userData:', error);
        this.logout();
      }
    } else {
      this.logout();
    }
  }

  login(response: UserData): void {
    if (!response.email || !response.roles || !response.token) {
      throw new Error('بيانات تسجيل الدخول غير صالحة');
    }

    this.userData = response;

    localStorage.setItem('userData', JSON.stringify(response));
    localStorage.setItem('token', response.token);

    this.roleSubject.next(response.roles);
    this.isLoggedInSubject.next(true);

    if (response.rememberMe) {
      localStorage.setItem('savedEmail', response.email);
    } else {
      localStorage.removeItem('savedEmail');
    }
  }

  logout(): void {
    this.isLoggedInSubject.next(false);
    this.roleSubject.next(null);
    this.userData = null;
    localStorage.removeItem('userData');
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('token');
  }

  getUserData(): UserData | null {
    return this.userData;
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('توكن من AuthService:', token);
    return token;
  }

  // جلب الدور الحالي
  getCurrentRole(): string | null {
    const roles = this.roleSubject.value;
    console.log('الأدوار الحالية:', roles);
    return roles?.[0] ?? null; // أول دور فقط
  }

  getSavedEmail(): string | null {
    const savedEmail = localStorage.getItem('savedEmail');
    console.log('email: ', savedEmail);
    return savedEmail;
  }
}
