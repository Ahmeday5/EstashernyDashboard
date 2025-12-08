import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import {
  Observable,
  fromEvent,
  debounceTime,
  distinctUntilChanged,
  map,
} from 'rxjs';
import { RouterModule } from '@angular/router';
import { PaginationComponent } from "../../../layout/pagination/pagination.component";

@Component({
  selector: 'app-alldoctor',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  templateUrl: './alldoctor.component.html',
  styleUrl: './alldoctor.component.scss',
})
export class AlldoctorComponent implements OnInit {
  specialities: any[] = [];
  doctors: any[] = [];
  displayedDoctors: any[] = [];
  loading: boolean = true;
  selectedSpeciality: string | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalPages: number = 0;
  pages: number[] = [];
  noDoctorsMessage: string | null = null;
  searchQuery: string = '';

  @ViewChild('searchInput', { static: false })
  searchInput!: ElementRef<HTMLInputElement>;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchSpecialities();
    this.fetchAllDoctors();
    this.setupSearchListener();
  }

  // دالة لجلب التخصصات
  fetchSpecialities() {
    this.loading = true;
    this.apiService.getAllSpecialities().subscribe({
      next: (data) => {
        this.specialities = data;
        console.log('التخصصات المستلمة:', data);
        this.loading = false;
      },
      error: (error) => {
        console.error('خطأ في جلب التخصصات:', error);
        this.loading = false;
      },
    });
  }

    // دالة لجلب كل الدكاترة)
    fetchAllDoctors() {
      this.loading = true;
      this.noDoctorsMessage = null;
      this.selectedSpeciality = null;
      this.searchQuery = '';
      this.apiService.getAllDoctors().subscribe({
        next: (data) => {
          this.doctors = Array.isArray(data) ? data : [];
          if (this.doctors.length === 0) {
            this.noDoctorsMessage = 'لا يوجد دكاترة متاحة';
          }
          this.updatePagination();
          //console.log('كل الدكاترة:', data);
          this.loading = false;
        },
        error: (error) => {
          console.error('خطأ في جلب كل الدكاترة:', error);
          this.loading = false;
        },
      });
    }

  // دالة لجلب الدكاترة حسب التخصص
  fetchDoctorsBySpecialization(specialityName: string) {
    this.loading = true;
    this.noDoctorsMessage = null;
    this.selectedSpeciality = specialityName;
    this.searchQuery = '';
    this.apiService.getDoctorsBySpecialization(specialityName).subscribe({
      next: (data) => {
        this.doctors = Array.isArray(data) ? data : [];
        if (this.doctors.length === 0) {
          this.noDoctorsMessage = `لا يوجد دكاترة في التخصص: ${specialityName}`; // رسالة لو مفيش دكاترة
        }
        this.updatePagination(); // تحديث الـ Pagination
        console.log(`الدكاترة بتاعين ${specialityName}:`, data); // طباعة للتحقق
        this.loading = false; // إخفاء الـ Spinner
      },
      error: (error) => {
        console.error(`خطأ في جلب الدكاترة بتاعين ${specialityName}:`, error); // طباعة الخطأ
        this.loading = false; // إخفاء الـ Spinner
      },
    });
  }

  // دالة للبحث عن الدكاترة حسب الاسم مع مراعاة التخصص المختار
  searchDoctors(query: string) {
    this.loading = true; // تفعيل الـ Spinner
    this.noDoctorsMessage = null; // مسح أي رسالة خطأ سابقة
    this.currentPage = 1; // إعادة الصفحة للأول عند البحث

    // إذا كانت القيمة فارغة، رجوع لعرض الدكاترة حسب التخصص أو الكل
    if (!query.trim()) {
      if (this.selectedSpeciality) {
        this.fetchDoctorsBySpecialization(this.selectedSpeciality); // رجوع للتخصص المختار
      } else {
        this.fetchAllDoctors(); // رجوع لكل الدكاترة
      }
      return;
    }

    // استدعاء البحث من الـ API
    this.apiService.searchByDoctorName(query).subscribe({
      next: (data) => {
        this.doctors = Array.isArray(data) ? data : []; // تخزين الدكاترة المرجعة
        // لو فيه تخصص مختار، نفلتر النتائج يدويًا
        if (this.selectedSpeciality) {
          this.doctors = this.doctors.filter(
            (doctor) =>
              doctor.specialization === this.selectedSpeciality &&
              doctor.name.toLowerCase().includes(query.toLowerCase())
          );
        } else {
          this.doctors = this.doctors.filter((doctor) =>
            doctor.name.toLowerCase().includes(query.toLowerCase())
          );
        }
        if (this.doctors.length === 0) {
          this.noDoctorsMessage = `لا يوجد دكاترة يحتوون على "${query}"${
            this.selectedSpeciality ? ` في ${this.selectedSpeciality}` : ''
          }`;
        }
        this.updatePagination(); // تحديث الـ Pagination
        console.log(
          `نتائج البحث عن "${query}" مع ${
            this.selectedSpeciality || 'كل التخصصات'
          }:`,
          data
        );
        this.loading = false; // إخفاء الـ Spinner
      },
      error: (error) => {
        console.error(`خطأ في البحث عن "${query}":`, error); // طباعة الخطأ
        this.loading = false; // إخفاء الـ Spinner
        this.noDoctorsMessage = `فشل البحث عن "${query}"`; // رسالة خطأ
      },
    });
  }

  // دالة لتحديث الـ Pagination وتحديد الدكاترة المعروضين
  updatePagination() {
    this.totalPages = Math.ceil(this.doctors.length / this.itemsPerPage); // حساب إجمالي الصفحات
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1); // إنشاء مصفوفة الأرقام (1, 2, 3, ...)
    this.updateDisplayedDoctors(); // تحديث الدكاترة المعروضين بناءً على الصفحة الحالية
  }

  // دالة لتحديث الدكاترة المعروضين حسب الصفحة
  updateDisplayedDoctors() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage; // بداية النطاق
    const endIndex = startIndex + this.itemsPerPage; // نهاية النطاق
    this.displayedDoctors = this.doctors.slice(startIndex, endIndex); // استخراج الدكاترة المعروضين
  }

  // دالة تشتغل لما تضغط على زرار فلتر
  onFilterClick(specialityName: string | null) {
    this.currentPage = 1; // إعادة الصفحة للأول لما يتغير الفلتر
    this.searchQuery = ''; // مسح قيمة البحث لما يتغير الفلتر
    if (specialityName === null) {
      this.fetchAllDoctors(); // لو الضغط على "كل التخصصات"، جيب كل الدكاترة
    } else {
      this.fetchDoctorsBySpecialization(specialityName); // لو تخصص معين، جيب الدكاترة بتاعينه
    }
  }

  // دالة لتغيير الصفحة
  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page; // تحديث الصفحة الحالية
      this.updateDisplayedDoctors(); // تحديث الدكاترة المعروضين
    }
  }

  // دالة جديدة للبحث التلقائي
  onSearch(query: string) {
    this.searchQuery = query; // تحديث قيمة البحث
    this.searchDoctors(query); // استدعاء دالة البحث المدمجة
  }

  // دالة لإعداد المستمع للبحث مع تأخير (debounce)
  setupSearchListener() {
    if (this.searchInput && this.searchInput.nativeElement) {
      fromEvent(this.searchInput.nativeElement, 'input')
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          map((event: Event) => (event.target as HTMLInputElement).value)
        )
        .subscribe((query: string) => {
          this.onSearch(query);
        });
    } else {
      console.error('حقل البحث غير موجود');
    }
  }
}
