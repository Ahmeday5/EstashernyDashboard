import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { PaginationComponent } from '../../layout/pagination/pagination.component';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmModalService } from '../../shared/components/confirm-modal/confirm-modal.service';
import { staggerInAnimation } from '../../core/animations/list.animations';

@Component({
  selector: 'app-advertisements',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './advertisements.component.html',
  styleUrl: './advertisements.component.scss',
  animations: [staggerInAnimation],
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
  isSubmitting: boolean = false;

  constructor(
    private apiService: ApiService,
    private toast: ToastService,
    private confirmModal: ConfirmModalService,
  ) {}

  ngOnInit() {
    this.fetchAdvertisements(); // استدعاء الاعلانات في البداية
  }

  handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target.files && target.files.length > 0) {
      const file = target.files[0];

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const width = img.width;
        const height = img.height;

        const ratio = width / height;

        const targetRatio = 16 / 9;

        if (Math.abs(ratio - targetRatio) > 0.02) {
          this.errorMessage = 'يجب أن تكون صورة الإعلان بنسبة 16:9';
          this.Advertisement.ImageFile = null;
          target.value = '';
          return;
        }

        this.errorMessage = '';
        this.Advertisement.ImageFile = file;
      };

      img.src = objectUrl;
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

      this.toast.success(response.message || 'تم إضافة الإعلان بنجاح');
      this.form.resetForm();
      this.Advertisement.Title = '';
      this.Advertisement.ImageFile = null;
      this.fetchAdvertisements();
      formElement.classList.remove('was-validated');
    } catch (error: any) {
      console.error('خطأ في إضافة الإعلان:', error);
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

  async deleteAdvertisement(id: number) {
    const confirmed = await this.confirmModal.confirm({
      title: 'حذف الإعلان',
      message: 'هل أنت متأكد أنك تريد حذف هذا الإعلان؟',
      confirmLabel: 'حذف',
      tone: 'danger',
    });
    if (!confirmed) return;

    this.apiService.deleteAdvertisements(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success(response.message || 'تم حذف الإعلان بنجاح');
          // إعادة تحميل الصفحة الحالية بعد الحذف
          this.fetchAdvertisements(this.currentPage);
        } else {
          this.toast.error(response.message || 'فشل في حذف الإعلان');
        }
      },
      error: (error) => {
        console.error('خطأ في حذف الإعلان:', error);
      },
    });
  }
}
