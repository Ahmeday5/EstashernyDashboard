import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { PaginationComponent } from '../../../layout/pagination/pagination.component';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmModalService } from '../../../shared/components/confirm-modal/confirm-modal.service';

// تعريف واجهة للمستخدم
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  picture: string;
  nationalID: string;
  roles: string[];
  token: string | null;
}

interface EmployeeResponse {
  message: string;
  employees: Employee[];
}

@Component({
  selector: 'app-all-user',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  templateUrl: './all-user.component.html',
  styleUrl: './all-user.component.scss',
})
export class AllUserComponent implements OnInit {
  employees: Employee[] = []; // لتخزين بيانات المستخدمين
  displayedemployees: any[] = [];
  loading: boolean = false; // لعرض الـ Spinner أثناء التحميل
  noUsersMessage: string = ''; // رسالة لو مفيش مستخدمين
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  pages: number[] = [];

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private confirmModal: ConfirmModalService,
  ) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  // جلب جميع المستخدمين
  async fetchEmployees(): Promise<void> {
    this.loading = true;
    this.noUsersMessage = '';

    try {
      const response = await firstValueFrom(this.apiService.getAllUser());
      this.employees = response.employees || [];
      if (this.employees.length === 0) {
        this.noUsersMessage = 'لا يوجد مستخدمين متاحين';
      }
      this.updatePagination();
      //console.log('كل الدكاترة:', data);
      this.loading = false;
    } catch (error: any) {
      console.error('فشل في جلب المستخدمين:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  /************ delete user ******************/
  async deleteUser(id: number): Promise<void> {
    const confirmed = await this.confirmModal.confirm({
      title: 'حذف المستخدم',
      message: 'هل أنت متأكد من حذف هذا المستخدم؟',
      confirmLabel: 'حذف',
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      const response = await firstValueFrom(this.apiService.deleteUser(id));
      // التعامل مع الاستجابة بناءً على الرسالة بدل الاعتماد على success بس
      if (
        typeof response === 'object' &&
        response.message &&
        response.message.includes('Employee Deleted Successfully')
      ) {
        this.toast.success(response.message || 'تم حذف المستخدم بنجاح');
        // حذف المستخدم من القائمة محليًا فورًا
        this.employees = this.employees.filter((s) => s.id !== id);
        if (this.employees.length === 0) {
          this.noUsersMessage = 'لا يوجد مستخدمين متاحين';
        }
        this.updatePagination();
        this.cdr.detectChanges();
      } else {
        this.toast.error(
          typeof response === 'string'
            ? response
            : response.message || 'فشل في حذف المستخدم',
        );
      }
    } catch (error: any) {
      console.error('خطأ في حذف المستخدم:', error);
    }
  }

  // دالة لتحديث الـ Pagination وتحديد الدكاترة المعروضين
  updatePagination() {
    this.totalPages = Math.ceil(this.employees.length / this.itemsPerPage); // حساب إجمالي الصفحات
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1); // إنشاء مصفوفة الأرقام (1, 2, 3, ...)
    this.updateDisplayedDoctors(); // تحديث الدكاترة المعروضين بناءً على الصفحة الحالية
  }

  // دالة لتحديث الدكاترة المعروضين حسب الصفحة
  updateDisplayedDoctors() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage; // بداية النطاق
    const endIndex = startIndex + this.itemsPerPage; // نهاية النطاق
    this.displayedemployees = this.employees.slice(startIndex, endIndex); // استخراج الدكاترة المعروضين
  }

  // دالة لتغيير الصفحة
  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page; // تحديث الصفحة الحالية
      this.updateDisplayedDoctors(); // تحديث الدكاترة المعروضين
    }
  }
}
