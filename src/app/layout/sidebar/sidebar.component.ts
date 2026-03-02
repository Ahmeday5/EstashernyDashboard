import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit {
  isSidebarOpen: boolean = window.innerWidth > 992;

  menuItems: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.updateMenuItems();
    this.authService.role$.subscribe((role) => {
      this.updateMenuItems();
    });
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', () => {
      this.isSidebarOpen = window.innerWidth > 992;
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // دالة تسجيل الخروج
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  isActive(path: string): boolean {
    return path
      ? this.router.isActive(path, {
          paths: 'subset',
          queryParams: 'subset',
          fragment: 'ignored',
          matrixParams: 'ignored',
        })
      : false;
  }

  // دالة للتحقق إذا كان العنصر هو زر تسجيل الخروج
  isLogoutItem(item: any): boolean {
    return item.label === 'تسجيل الخروج';
  }

  // دالة لفتح/إغلاق القائمة الفرعية
  toggleSubmenu(index: number): void {
    this.menuItems[index].isOpen = !this.menuItems[index].isOpen;
    // تغيير حالة isOpen للعنصر المحدد بالمؤشر
    // ده بيفتح أو يغلق القائمة الفرعية.
  }

  // قائمة العناصر في الـ Sidebar
  // تحديث القائمة بناءً على الدور
  // تحديث القائمة بناءً على الدور بطريقة احترافية
  private updateMenuItems(): void {
    const baseMenuItems = [
      {
        label: 'الرئيسية',
        path: '/dashboard',
        icons: 'fa-solid fa-house',
        allowedRoles: ['Admin'], // متاح للجميع
      },
      {
        label: 'دكتور',
        path: null,
        icons: 'fa-solid fa-user-md',
        allowedRoles: ['Admin', 'Editor', 'Sales'], // Sales يحتاجها
        submenu: [
          {
            key: 'جميع الأطباء',
            path: '/alldoctor',
            icon: 'fa-solid fa-briefcase-medical',
          },
          {
            key: 'إنشاء حسابات الأطباء',
            path: '/adddoctor',
            icon: 'fa-solid fa-house-medical',
          },
        ],
      },
      {
        label: 'المستخدمين',
        path: null,
        icons: 'fa-solid fa-users',
        isOpen: false,
        allowedRoles: ['Admin'], // غير متاح لـ Sales أو Marketing
        submenu: [
          { key: 'المستخدمين', path: '/alluser', icon: 'fa-solid fa-users' },
          {
            key: 'إضافة مستخدم جديد',
            path: '/adduser',
            icon: 'fa-solid fa-user-plus',
          },
        ],
      },
      {
        label: 'التقارير',
        path: '/reports',
        icons: 'fa-solid fa-chart-bar',
        allowedRoles: ['Admin'],
      },
      {
        label: 'إضافة خصم',
        path: '/discount',
        icons: 'fa-solid fa-percent',
        allowedRoles: ['Admin', 'Sales'], // Sales يحتاجها
      },
      {
        label: 'التخصصات',
        path: '/Specialities',
        icons: 'fa-solid fa-stethoscope',
        allowedRoles: ['Admin', 'Editor'],
      },
      {
        label: 'الإشعارات',
        path: '/notification',
        icons: 'fa-solid fa-bell',
        allowedRoles: ['Admin', 'Editor', 'Marketing'], // Marketing يحتاجها
      },
      {
        label: 'المرضي',
        path: '/patient',
        icons: 'fa-solid fa-user-injured',
        allowedRoles: ['Admin', 'Editor'],
      },
      {
        label: 'الاعلانات',
        path: '/Advertisements',
        icons: 'fa-solid fa-bullhorn',
        allowedRoles: ['Admin', 'Editor', 'Marketing'], // Marketing يحتاجها
      },
      {
        label: 'سياسة الخصوصية',
        path: '/privacy-policy',
        icons: 'fa-solid fa-file-contract',
        allowedRoles: ['Admin', 'Editor'],
      },
      {
        label: 'تسجيل الخروج',
        path: null,
        icons: 'fa-solid fa-sign-out-alt',
        allowedRoles: ['Admin', 'Editor', 'Sales', 'Marketing'], // متاح للجميع
      },
    ];

    const role = this.authService.getCurrentRole();
    if (role) {
      // تصفية العناصر بناءً على allowedRoles
      this.menuItems = baseMenuItems.filter((item) =>
        item.allowedRoles.includes(role),
      );
    } else {
      this.menuItems = []; // لا صلاحيات إذا لم يكن هناك دور
    }
  }
}
