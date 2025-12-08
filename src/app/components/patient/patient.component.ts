import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { fromEvent, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { PaginationComponent } from "../../layout/pagination/pagination.component";

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.scss',
})


export class PatientComponent {
  patients: any[] = [];
  displayedPatients: any[] = [];
  loading: boolean = true;
  currentPage: number = 1;
  pageSize: number = 8;
  totalItems: number = 0;
  totalPages: number = 0;
  pages: number[] = [];
  noPatientsMessage: string | null = null;
  searchQuery: string = '';

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchPatients();
    this.setupSearchListener();
  }

  fetchPatients(name: string = '') {
    this.loading = true;
    this.noPatientsMessage = null;
    this.apiService
      .searchPatientsByName(name, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.patients = response.data;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
          this.displayedPatients = this.patients; // الباجنيشن تتم عبر الـ API
          if (this.patients.length === 0) {
            this.noPatientsMessage = name
              ? `لا يوجد مرضى يحتون على "${name}"`
              : 'لا يوجد مرضى متاحين';
          }
          this.loading = false;
          console.log('بيانات المرضى:', response);
        },
        error: (error) => {
          console.error('خطأ في جلب المرضى:', error);
          this.noPatientsMessage = 'فشل جلب بيانات المرضى';
          this.loading = false;
        },
      });
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchPatients(this.searchQuery);
    }
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.currentPage = 1;
    this.fetchPatients(query);
  }

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
    }
  }
}
