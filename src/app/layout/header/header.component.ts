import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  breadcrumbs: { label: string; url: string }[] = []; // مصفوفة الـ breadcrumbs لتخزين الروابط وأسمائها

  userData: any = null; // متغير بيخزن بيانات المستخدم من localStorage
  username: string = 'ادمن'; // اسم المستخدم الافتراضي
  userImage: string = '/assets/img/logo-login.png'; // صورة افتراضية

  constructor(
    private authService: AuthService, // حقن AuthService
    private router: Router, // حقن Router
    private activatedRoute: ActivatedRoute // حقن ActivatedRoute
  ) {}

  ngOnInit(): void {
    // الاشتراك في أحداث التنقل لتحديث الـ breadcrumbs
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd), // تصفية الأحداث لأحداث إكمال التنقل فقط
        map(() => this.activatedRoute), // الحصول على الروت الحالي
        map((route) => {
          // البحث عن الروت الأساسي (root)
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        map((route) => route.snapshot) // الحصول على snapshot للروت
      )
      .subscribe((route) => {
        this.breadcrumbs = this.getBreadcrumbs(route); // تحديث الـ breadcrumbs
      });

    // جلب بيانات المستخدم
    this.loadUserData();
  }

  // دالة لبناء الـ breadcrumbs
  private getBreadcrumbs(
    route: any,
    url: string = '',
    breadcrumbs: { label: string; url: string }[] = []
  ): { label: string; url: string }[] {
    const routeData = route.data; // الحصول على بيانات الروت
    const routeUrl = route.url
      .map((segment: { path: any }) => segment.path)
      .join('/'); // بناء عنوان URL الخاص بالروت
    const label = routeData?.breadcrumb || ''; // الحصول على اسم breadcrumb من بيانات الروت

    // إضافة breadcrumb إذا كان موجود
    if (label) {
      breadcrumbs.push({ label, url: url + '/' + routeUrl });
    }

    // إذا كان هناك روت فرعي، استمر في البحث
    if (route.firstChild) {
      return this.getBreadcrumbs(
        route.firstChild,
        url + '/' + routeUrl,
        breadcrumbs
      );
    }

    return breadcrumbs; // إرجاع الـ breadcrumbs
  }

  // دالة لتحميل بيانات المستخدم
  loadUserData(): void {
    this.userData = this.authService.getUserData(); // جلب البيانات
    if (this.userData) { // لو البيانات موجودة
      this.username = `${this.userData.firstName}`; // تحديث الاسم
      this.userImage = this.userData.picture && this.userData.picture !== 'N/A'
        ? this.userData.picture
        : '/assets/img/logo-login.png'; // تحديث الصورة
    }
  }

  // دالة تسجيل الخروج
  logout(): void {
    this.authService.logout(); // استدعاء الخروج
    this.router.navigate(['/']); // التوجيه للرئيسية
    this.loadUserData(); // إعادة تحميل البيانات
  }

}
