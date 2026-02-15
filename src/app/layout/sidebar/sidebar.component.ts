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
  private updateMenuItems(): void {
    const baseMenuItems = [
      { label: 'الرئيسية', path: '/dashboard', icons: 'fa-solid fa-house' },
      {
        label: 'دكتور',
        path: null,
        icons: 'fa-solid fa-user-md',
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
        submenu: [
          { key: 'المستخدمين', path: '/alluser', icon: 'fa-solid fa-users' },
          {
            key: 'إضافة مستخدم جديد',
            path: '/adduser',
            icon: 'fa-solid fa-user-plus',
          },
        ],
      },
      { label: 'التقارير', path: '/reports', icons: 'fa-solid fa-chart-bar' },
      { label: 'إضافة خصم', path: '/discount', icons: 'fa-solid fa-percent' },
      {
        label: 'التخصصات',
        path: '/Specialities',
        icons: 'fa-solid fa-stethoscope',
      },
      { label: 'الإشعارات', path: '/notification', icons: 'fa-solid fa-bell' },
      { label: 'المرضي', path: '/patient', icons: 'fa-solid fa-user-injured' },
      {
        label: 'الاعلانات',
        path: '/Advertisements',
        icons: 'fa-solid fa-bullhorn',
      },
      { label: 'تسجيل الخروج', path: null, icons: 'fa-solid fa-sign-out-alt' },
    ];

    const role = this.authService.getCurrentRole();
    if (role && role.includes('Admin')) {
      this.menuItems = [...baseMenuItems]; // Admin يشوف الكل
    } else if (role && role.includes('Editor')) {
      this.menuItems = baseMenuItems.filter((item) => {
        return !['المستخدمين', 'التقارير', 'إضافة خصم'].includes(item.label);
      });
    } else {
      this.menuItems = []; // لو مفيش دور، يظهرش حاجة
    }
  }
}
