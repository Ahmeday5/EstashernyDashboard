import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService } from '../../services/api.service'; // تأكد من المسار الصحيح
import { firstValueFrom } from 'rxjs';

// تعريف واجهة للتخصصات
interface Specialization {
  id: number;
  name: string;
}

// تعريف واجهة لأسماء الدكاترة
interface DoctorName {
  doctorNames: string[];
  message: string;
}

// تعريف واجهة للبيانات اليومية والشهرية
interface ProfitData {
  doctorId: number;
  doctorName: string;
  monthName: string;
  dailyProfit: number;
  dailyAppointmentsCount: number;
  monthlyProfit: number;
  monthlyAppointmentsCount: number;
  totalProfit: number;
  totalAppointmentsCount: number;
}

interface ProfitResponse {
  message: string;
  profits: ProfitData[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  specializations: Specialization[] = []; // لتخزين التخصصات
  doctorNames: string[] = []; // لتخزين أسماء الدكاترة
  profits: ProfitData[] = []; // لتخزين بيانات الأرباح والمواعيد

  // متغيرات الفلترة
  selectedSpecialization: string = ''; // التخصص المختار
  selectedDoctor: string = ''; // الدكتور المختار
  selectedDate: string = ''; // التاريخ المختار

  // متغيرات التحكم في الواجهة
  loading: boolean = false; // لعرض الـ Spinner أثناء التحميل
  errorMessage: string = ''; // لعرض رسايل الخطأ
  successMessage: string = ''; // لعرض رسايل النجاح

  constructor(private apiService: ApiService) {} // حقن الـ ApiService

  ngOnInit() {
    this.fetchSpecializations();
    this.fetchDoctorNames();
  }

  async fetchSpecializations(): Promise<void> {
    this.loading = true; // شغّل الـ Spinner
    this.errorMessage = ''; // مسح أي رسايل خطأ سابقة

    try {
      const response = await firstValueFrom(this.apiService.getAllSpecialities());
      // التعامل مع الاستجابة بنفس طريقة addDoctorComponent
      this.specializations = Array.isArray(response) ? response : (response.data || []);
      if (this.specializations.length === 0) {
        this.errorMessage = 'لا يوجد تخصصات متاحة'; // رسالة لو مفيش تخصصات
      }
    } catch (error: any) {
      console.error('فشل في جلب التخصصات:', error);
      this.errorMessage = 'حدث خطأ أثناء جلب التخصصات';
    } finally {
      this.loading = false; // اطفي الـ Spinner سواء نجح أو فشل
    }
  }

  // دالة جلب أسماء الدكاترة
  async fetchDoctorNames(): Promise<void> {
    this.loading = true; // شغّل الـ Spinner
    this.errorMessage = ''; // مسح أي رسايل خطأ

    try {
      const response = await firstValueFrom(this.apiService.getAllDoctorsNames());
      this.doctorNames = response.doctorNames || []; // تخزين أسماء الدكاترة
      if (this.doctorNames.length === 0) {
        this.errorMessage = 'لا يوجد دكاترة متاحين'; // رسالة لو مفيش دكاترة
      }
    } catch (error: any) {
      console.error('فشل في جلب أسماء الدكاترة:', error);
      this.errorMessage = 'حدث خطأ أثناء جلب أسماء الدكاترة';
    } finally {
      this.loading = false; // اطفي الـ Spinner
    }
  }

  // دالة جلب بيانات الأرباح والمواعيد مع فلترة
  async fetchProfits(): Promise<void> {
    this.loading = true; // شغّل الـ Spinner
    this.errorMessage = ''; // مسح أي رسايل خطأ
    this.successMessage = ''; // مسح أي رسايل نجاح

    try {
      const params: { [key: string]: string } = {};
      if (this.selectedDate) params['date'] = this.selectedDate; // لو فيه تاريخ، نضيفه
      if (this.selectedSpecialization) params['specialty'] = this.selectedSpecialization; // لو فيه تخصص
      if (this.selectedDoctor) params['doctorName'] = this.selectedDoctor; // لو فيه اسم دكتور

      const response = await firstValueFrom(this.apiService.getDoctorsDailyAndMonthlyProfit(params));
      this.profits = response.profits || []; // تخزين البيانات
      this.successMessage = response.message; // عرض رسالة النجاح
       setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      if (this.profits.length === 0) {
        this.errorMessage = 'لا يوجد بيانات متاحة بناءً على الفلاتر'; // رسالة لو مفيش بيانات
      }
    } catch (error: any) {
      console.error('فشل في جلب بيانات الأرباح:', error);
      this.errorMessage = 'لم يتم العثور على مواعيد مدفوعة ومختارة. ';
    } finally {
      this.loading = false; // اطفي الـ Spinner
    }
  }
}
