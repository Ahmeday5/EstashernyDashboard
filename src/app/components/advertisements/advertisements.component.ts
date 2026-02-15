import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { PaginationComponent } from '../../layout/pagination/pagination.component';

@Component({
  selector: 'app-advertisements',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './advertisements.component.html',
  styleUrl: './advertisements.component.scss',
})
export class AdvertisementsComponent implements OnInit {
  @ViewChild('form') form!: NgForm;
  @ViewChild('form', { static: false, read: ElementRef })
  formElement!: ElementRef<HTMLFormElement>;

  Advertisements: { id: number; title: string; imageUrl: string }[] = []; // تحديد نوع البيانات // مصفوفة لتخزين الاعلانات
  loading: boolean = true; // متغير للتحكم في عرض الـ Spinner أثناء التحميل
  noAdvertisementsMessage: string | null = null; // رسالة لو مفيش تخصصات
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;

  Advertisement = { Title: '', ImageFile: null as File | null };
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchAdvertisements(); // استدعاء الاعلانات في البداية
  }

  handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.Advertisement.ImageFile = target.files[0]; // ⚠️ فقط هنا
    }
  }

  async handleSubmit(): Promise<void> {
    const formElement = this.formElement.nativeElement;

    if (!formElement.checkValidity()) {
      formElement.classList.add('was-validated');
      return;
    }

    if (!this.Advertisement.ImageFile) {
      this.errorMessage = 'يرجى اختيار صورة للإعلان';
      return;
    }

    this.isSubmitting = true; // 🔹 بدأ التحميل

    try {
      const response = await firstValueFrom(
        this.apiService.addAdvertisements({
          Title: this.Advertisement.Title.trim(),
          ImageFile: this.Advertisement.ImageFile,
        }),
      );

      this.successMessage = response.message;
      this.form.resetForm();
      this.Advertisement.Title = '';
      this.Advertisement.ImageFile = null;
      formElement.classList.remove('was-validated');

      setTimeout(() => {
        this.successMessage = '';
        this.errorMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'حدث خطأ أثناء الإرسال';
    } finally {
      this.isSubmitting = false; // 🔹 انتهاء التحميل
    }
  }

  /*******************get Advertisements *****************/

  // دالة لجلب اعلانات
  fetchAdvertisements(page: number = 1) {
    this.loading = true;
    this.noAdvertisementsMessage = null;

    this.apiService.getAllAdvertisements(page, this.pageSize).subscribe({
      next: (response) => {
        // Response من السيرفر
        this.Advertisements = response.data || [];
        this.totalItems = response.total;
        this.pageSize = response.pageSize;
        this.currentPage = response.page;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);

        if (this.Advertisements.length === 0) {
          this.noAdvertisementsMessage = 'لا يوجد إعلانات متاحة';
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('خطأ في جلب الإعلانات:', error);
        this.loading = false;
        this.noAdvertisementsMessage = 'حدث خطأ أثناء جلب الإعلانات';
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchAdvertisements(page);
  }

  /*************************delete Advertisement ***********************/

  deleteAdvertisement(id: number) {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذا الإعلان؟')) return;

    this.apiService.deleteAdvertisements(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message || 'تم حذف الإعلان بنجاح';
          setTimeout(() => (this.successMessage = ''), 3000);

          // إعادة تحميل الصفحة الحالية بعد الحذف
          this.fetchAdvertisements(this.currentPage);
        } else {
          this.errorMessage = response.message || 'فشل في حذف الإعلان';
          setTimeout(() => (this.errorMessage = ''), 3000);
        }
      },
      error: (error) => {
        console.error('خطأ في حذف الإعلان:', error);
        this.errorMessage = error.message || 'حدث خطأ أثناء الحذف';
        setTimeout(() => (this.errorMessage = ''), 3000);
      },
    });
  }
}
