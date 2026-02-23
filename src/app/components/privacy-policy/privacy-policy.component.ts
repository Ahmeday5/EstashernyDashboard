import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
})
export class PrivacyPolicyComponent implements OnInit {

  content!: SafeHtml;
  loading = true;

  // مودال إضافة
  editorContent: string = '';
  selectedPageType: number = 1; // 1 -> Doctors, 2 -> Patients
  updating = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadPrivacyPolicy();
  }

  loadPrivacyPolicy(pageType: number = 1) {
    this.loading = true;
    this.apiService.getStaticPage(pageType).subscribe({
      next: (res) => {
        this.content = this.sanitizer.bypassSecurityTrustHtml(res);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  openModal(pageType: number) {
    this.selectedPageType = pageType;
    this.apiService.getStaticPage(pageType).subscribe({
      next: (res) => { this.editorContent = res; },
      error: () => { this.editorContent = ''; },
    });
  }

  saveContent() {
    if (!this.editorContent.trim()) return;

    this.updating = true;
    this.apiService.updateStaticPage(this.selectedPageType, this.editorContent)
      .subscribe({
        next: (res) => {
          this.successMessage = 'تم التحديث بنجاح!';
          this.loadPrivacyPolicy(this.selectedPageType);
          this.updating = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'حدث خطأ';
          this.updating = false;
        },
      });
  }
}
