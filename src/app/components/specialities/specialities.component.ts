import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmModalService } from '../../shared/components/confirm-modal/confirm-modal.service';
import { staggerInAnimation } from '../../core/animations/list.animations';

@Component({
  selector: 'app-specialities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './specialities.component.html',
  styleUrl: './specialities.component.scss',
  animations: [staggerInAnimation],
})
export class SpecialitiesComponent implements OnInit {
  @ViewChild('form') form!: NgForm;
  @ViewChild('form', { static: false, read: ElementRef })
  formElement!: ElementRef<HTMLFormElement>;

  specialities: { id: number; name: string }[] = []; // تحديد نوع البيانات // مصفوفة لتخزين التخصصات
  loading: boolean = true; // متغير للتحكم في عرض الـ Spinner أثناء التحميل
  nospecialitiesMessage: string | null = null; // رسالة لو مفيش تخصصات

  Specialty = { name: '', imageUrl: '' };

  constructor(
    private apiService: ApiService,
    private toast: ToastService,
    private confirmModal: ConfirmModalService,
  ) {}

  ngOnInit() {
    this.fetchSpecialities(); // استدعاء التخصصات في البداية
  }

  async handleSubmit(): Promise<void> {
    const formElement = this.formElement.nativeElement;

    // ✅ التحقق من صحة النموذج
    if (!formElement.checkValidity()) {
      formElement.classList.add('was-validated');
      return;
    }

    // ✅ إنشاء الـ Body (وليس params)
    const data = {
      name: this.Specialty.name.trim(),
      imageUrl: this.Specialty.imageUrl.trim(),
    };

    try {
      const response = await firstValueFrom(
        this.apiService.addSpecialitie(data)
      );

      if (response.success) {
        this.toast.success('تمت إضافة التخصص بنجاح');

        // ✅ إعادة ضبط النموذج
        this.form.resetForm();
        this.Specialty.name = '';
        this.Specialty.imageUrl = '';
        formElement.classList.remove('was-validated');

        // ✅ تحديث القائمة بعد الإضافة
        setTimeout(() => this.fetchSpecialities(), 500);
      } else {
        this.toast.error(response.message || 'فشل في إضافة التخصص');
      }
    } catch (error: any) {
      console.error('خطأ في إضافة التخصص:', error);
    }
  }

  /*******************get AllSpecialities *****************/

  // دالة لجلب التخصصات
  fetchSpecialities() {
    this.loading = true; // تفعيل الـ Spinner أثناء التحميل
    this.nospecialitiesMessage = null; // مسح الرسالة لو كانت موجودة

    this.apiService.getAllSpecialities().subscribe({
      next: (data) => {
        this.specialities = data || [];
        console.log('التخصصات المستلمة:', data); // طباعة للتحقق
        if (this.specialities.length === 0) {
          this.nospecialitiesMessage = 'لا يوجد تخصصات متاحة';
        }
        this.loading = false; // إخفاء الـ Spinner لما التحميل يخلص
      },
      error: (error) => {
        console.error('خطأ في جلب التخصصات:', error); // طباعة الخطأ لو فيه مشكلة
        this.loading = false; // إخفاء الـ Spinner حتى لو فشل
      },
    });
  }

  /*************************delete AllSpecialities ***********************/

  async deleteSpeciality(id: number) {
    const confirmed = await this.confirmModal.confirm({
      title: 'حذف التخصص',
      message: 'هل أنت متأكد أنك تريد حذف هذا التخصص؟',
      confirmLabel: 'حذف',
      tone: 'danger',
    });
    if (!confirmed) return;

    this.apiService.deleteSpecialty(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success(response.message || 'تم حذف التخصص بنجاح');
          // ✅ نحذف التخصص من المصفوفة مباشرة بدون Refresh
          this.specialities = this.specialities.filter((s) => s.id !== id);
        } else {
          this.toast.error(response.message || 'فشل في حذف التخصص');
        }
      },
      error: (error) => {
        console.error('❌ خطأ أثناء حذف التخصص:', error);
      },
    });
  }
}
