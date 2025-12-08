import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { PaginationComponent } from '../../../layout/pagination/pagination.component';

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
  imports: [CommonModule, PaginationComponent],
  templateUrl: './all-user.component.html',
  styleUrl: './all-user.component.scss',
})
export class AllUserComponent implements OnInit {
  employees: Employee[] = []; // لتخزين بيانات المستخدمين
  displayedemployees: any[] = [];
  loading: boolean = false; // لعرض الـ Spinner أثناء التحميل
  errorMessage: string = ''; // لعرض رسائل الخطأ
  successMessage: string = ''; // لعرض رسائل النجاح
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  pages: number[] = [];

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  // جلب جميع المستخدمين
  async fetchEmployees(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await firstValueFrom(this.apiService.getAllUser());
      this.employees = response.employees || [];
      if (this.employees.length === 0) {
        this.errorMessage = 'لا يوجد مستخدمين متاحين';
      }
      this.updatePagination();
      //console.log('كل الدكاترة:', data);
      this.loading = false;
    } catch (error: any) {
      console.error('فشل في جلب المستخدمين:', error);
      this.errorMessage = error.message || 'حدث خطأ أثناء جلب المستخدمين';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  /************ delete user ******************/
  async deleteUser(id: number): Promise<void> {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم')) {
      return; // لو الضغط كان Cancel، يرجع بدون عمل شيء
    }
    try {
      const response = await firstValueFrom(this.apiService.deleteUser(id));
      console.log('API Response for deleteUser:', response); // طباعة الاستجابة للتحقق
      // التعامل مع الاستجابة بناءً على الرسالة بدل الاعتماد على success بس
      if (
        typeof response === 'object' &&
        response.message &&
        response.message.includes('Employee Deleted Successfully')
      ) {
        this.successMessage =
          response.message || 'employee Deleted Successfully';
        // حذف المستخدم من القائمة محليًا فورًا
        this.employees = this.employees.filter((s) => s.id !== id);
        console.log('Employees after filter:', this.employees); // طباعة بعد الـ filter
        if (this.employees.length === 0) {
          this.errorMessage = 'لا يوجد مستخدمين متاحين';
        }
        this.cdr.detectChanges(); // تحديث الـ view فورًا
        // اختفاء الرسالة بعد 3 ثواني
        setTimeout(() => {
          this.successMessage = '';
          this.fetchEmployees();
          this.cdr.detectChanges();
        }, 1000);
      } else {
        this.errorMessage =
          typeof response === 'string'
            ? response
            : response.message || 'فشل في حذف المستخدم';
        this.cdr.detectChanges(); // تحديث الـ view لو فيه رسالة خطأ
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'حدث خطأ أثناء الحذف';
      console.error('خطأ في حذف المستخدم:', error);
      this.cdr.detectChanges(); // تحديث الـ view لو فيه خطأ
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
