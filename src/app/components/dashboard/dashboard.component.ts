import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // جلب أدوات مشتركة

import { HttpClient } from '@angular/common/http'; // استيراد خدمة HTTP لجلب البيانات
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';

/*interface StatResponse {
  total: number;
}*/

interface CardStat {
  id: number;
  label: string;
  value: number;
  valueToday: number;
  imgIcon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  loading: boolean = false;
  errorMessage: string | null = null; // لتخزين رسائل الخطأ
  cardStats: CardStat[] = [];

  constructor(private apiService: ApiService, private http: HttpClient) {} // حقن الخدمة

  ngOnInit() {
    // دالة بتشتغل لما المكون يبقى جاهز
    this.fetchStatsOrders(); // استدعاء الدالة اللي بتجيب البيانات
  }

  fetchStatsOrders() {
    this.loading = true;
    this.errorMessage = null;

    // استخدام forkJoin لجلب جميع البيانات في وقت واحد
    forkJoin({
      totalProfit: this.apiService.getTotalProfit(),
      profitToday: this.apiService.getProfitToday(),
      totalAppointments: this.apiService.getTotalAppointmentsCount(),
      todayAppointments: this.apiService.getTodayAppointmentsCount(),
      totalPatients: this.apiService.getTotalPatientsCount(),
      todayPatients: this.apiService.getTodayPatientsCount(),
    }).subscribe({
      next: (data) => {
        // تعبئة الكاردات بناءً على البيانات
        this.cardStats = [
          {
            id: 1,
            label: 'مواعيد جديدة',
            value: data.totalAppointments.total || 0,
            valueToday: data.todayAppointments.total || 0,
            imgIcon: '/assets/img/dashboard/appio.png',
          },
          {
            id: 2,
            label: 'المرضي الجدد',
            value: data.totalPatients.total || 0,
            valueToday: data.todayPatients.total || 0,
            imgIcon: '/assets/img/dashboard/pati.png',
          },
          {
            id: 3,
            label: 'الربح',
            value: data.totalProfit.total || 0,
            valueToday: data.profitToday.total || 0,
            imgIcon: '/assets/img/dashboard/profit.png',
          },
        ];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'فشل في جلب بيانات لوحة التحكم';
        console.error('مشكلة في جلب الـ Stats:', error);
        this.loading = false;
      },
    });
  }

  /*getStatClass(label: string): string {
    // دالة تحدد الكلاس
    switch (
      label // التحقق من الملصق
    ) {
      case 'المبلغ المطلوب منك':
      case 'المبلغ الصافي':
      case 'عدد الطلبات اليوم / الشهر':
        return 'white-div'; // خلفية بيضا
      case 'المبلغ المستحق لك':
      case 'عدد الموردين النشطين':
      case 'نسبة النمو أو التراجع':
        return 'blue-div'; // خلفية زرقا
      default:
        return ''; // افتراضي
    }
  }*/
}
