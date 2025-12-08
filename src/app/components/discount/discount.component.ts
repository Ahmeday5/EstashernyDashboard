import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

// واجهة لتعريف شكل بيانات الدكتور
interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

// واجهة لتعريف بيانات الخصم
interface Discount {
  doctorId: string; // بدل number | null
  date: string;
  discountPercentage: number | null;
}

@Component({
  selector: 'app-discount',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discount.component.html',
  styleUrl: './discount.component.scss',
})
export class DiscountComponent implements OnInit {
  @ViewChild('form') form!: NgForm; // مرجع للفورم في الـ HTML
  @ViewChild('form', { static: false, read: ElementRef })
  formElement!: ElementRef<HTMLFormElement>; // مرجع لعنصر الفورم كـ HTML

  doctorAndSpecialities: Doctor[] = []; // مصفوفة لتخزين بيانات الدكاترة
  loading: boolean = true; // متغير للتحكم في الـ Spinner
  nospecialitiesMessage: string | null = null; // رسالة لو مفيش دكاترة
  discount: Discount = { doctorId: '', date: '', discountPercentage: null }; // تهيئة الكائن بقيم null
  errorMessage: string = ''; // رسالة الخطأ
  successMessage: string = ''; // رسالة النجاح

  constructor(private apiService: ApiService) {} // حقن الـ ApiService

  ngOnInit() {
    // دالة التهيئة
    this.fetchDoctorsAndSpecialities(); // جلب بيانات الدكاترة
  }

  // دالة لجلب بيانات الدكاترة والتخصصات
  fetchDoctorsAndSpecialities() {
    this.loading = true; // تفعيل الـ Spinner
    this.nospecialitiesMessage = null; // مسح الرسالة

    this.apiService.getAllDoctorsIDNameAndSpecialization().subscribe({
      next: (response) => {
        this.doctorAndSpecialities = response.data; // تخزين البيانات
        console.log('بيانات الدكاترة والتخصصات:', this.doctorAndSpecialities);
        if (this.doctorAndSpecialities.length === 0) {
          this.nospecialitiesMessage = 'لا يوجد دكاترة متاحين';
        }
        this.loading = false; // إخفاء الـ Spinner
      },
      error: (error) => {
        console.error('خطأ في جلب الدكاترة والتخصصات:', error);
        this.nospecialitiesMessage = 'حدث خطأ أثناء جلب البيانات';
        this.loading = false;
      },
    });
  }

  // دالة التعامل مع إرسال الفورم
  async handleSubmit(): Promise<void> {
    const formElement = this.formElement.nativeElement;
    // التحقق من صحة الفورم
    if (!formElement.checkValidity()) {
      formElement.classList.add('was-validated');
      return;
    }

    // التأكد إن كل الحقول موجودة
    if (
      !this.discount.doctorId ||
      !this.discount.date ||
      this.discount.discountPercentage === null
    ) {
      this.errorMessage = 'يرجى ملء جميع الحقول';
      return;
    }

    // إنشاء الكائن اللي هيتبعت للـ API
    const params = {
      doctorId: parseInt(this.discount.doctorId),
      date: this.discount.date,
      discountPercentage: this.discount.discountPercentage,
    };

    try {
      // إرسال طلب إضافة الخصم
      const response = await firstValueFrom(
        this.apiService.applyDiscountToAppointment(params)
      );
      if (response.success) {
        // لو الإضافة نجحت
        this.successMessage = response.message;
        this.form.resetForm(); // إعادة ضبط الفورم
        this.discount = { doctorId: '', date: '', discountPercentage: null }; // إعادة ضبط الكائن
        formElement.classList.remove('was-validated');
      } else {
        // لو فشل (مثلاً مفيش مواعيد)
        this.errorMessage = response.message;
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'حدث خطأ أثناء إضافة الخصم';
      console.error('خطأ في إضافة الخصم:', error);
    }

    // إخفاء الرسائل بعد 5 ثواني
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }
}
