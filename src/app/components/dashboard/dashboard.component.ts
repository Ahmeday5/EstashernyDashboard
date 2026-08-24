import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule, ApexChart, ApexAxisChartSeries, ApexNonAxisChartSeries } from 'ng-apexcharts';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';
import { NavIconComponent, NavIconName } from '../../shared/components/nav-icon/nav-icon.component';
import { CountUpDirective } from '../../shared/directives/count-up.directive';
import { staggerInAnimation } from '../../core/animations/list.animations';

interface CardStat {
  id: number;
  label: string;
  value: number;
  valueToday: number;
  icon: NavIconName;
  tone: 'teal' | 'indigo' | 'amber';
  isCurrency?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavIconComponent, NgApexchartsModule, CountUpDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [staggerInAnimation],
})
export class DashboardComponent implements OnInit {
  loading = false;
  errorMessage: string | null = null;
  cardStats: CardStat[] = [];
  adminName = 'أدمن';

  protected donutSeries: ApexNonAxisChartSeries = [];
  protected readonly donutLabels = ['مواعيد', 'مرضى', 'ربح'];
  protected readonly donutChart: ApexChart = { type: 'donut', height: 260, animations: { enabled: true, easing: 'easeinout', speed: 500 } };
  protected readonly donutColors = ['#4b4e9c', '#14c8c7', '#f2a93c'];

  protected barSeries: ApexAxisChartSeries = [];
  protected readonly barCategories = ['مواعيد', 'مرضى', 'ربح'];
  protected readonly barChart: ApexChart = { type: 'bar', height: 260, toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 500 } };

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit() {
    const userData = this.authService.getUserData();
    if (userData?.firstName) {
      this.adminName = userData.firstName;
    }
    this.fetchStatsOrders();
  }

  fetchStatsOrders() {
    this.loading = true;
    this.errorMessage = null;

    forkJoin({
      totalProfit: this.apiService.getTotalProfit(),
      profitToday: this.apiService.getProfitToday(),
      totalAppointments: this.apiService.getTotalAppointmentsCount(),
      todayAppointments: this.apiService.getTodayAppointmentsCount(),
      totalPatients: this.apiService.getTotalPatientsCount(),
      todayPatients: this.apiService.getTodayPatientsCount(),
    }).subscribe({
      next: (data) => {
        const totalAppointments = data.totalAppointments.total || 0;
        const todayAppointments = data.todayAppointments.total || 0;
        const totalPatients = data.totalPatients.total || 0;
        const todayPatients = data.todayPatients.total || 0;
        const totalProfit = data.totalProfit.total || 0;
        const profitToday = data.profitToday.total || 0;

        this.cardStats = [
          {
            id: 1,
            label: 'مواعيد جديدة',
            value: totalAppointments,
            valueToday: todayAppointments,
            icon: 'reports',
            tone: 'indigo',
          },
          {
            id: 2,
            label: 'المرضى الجدد',
            value: totalPatients,
            valueToday: todayPatients,
            icon: 'patients',
            tone: 'teal',
          },
          {
            id: 3,
            label: 'الربح',
            value: totalProfit,
            valueToday: profitToday,
            icon: 'discount',
            tone: 'amber',
            isCurrency: true,
          },
        ];

        this.donutSeries = [todayAppointments, todayPatients, profitToday];
        this.barSeries = [
          { name: 'اليوم', data: [todayAppointments, todayPatients, profitToday] },
          { name: 'الإجمالي', data: [totalAppointments, totalPatients, totalProfit] },
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
}
