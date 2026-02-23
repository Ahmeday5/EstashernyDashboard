import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// CKEditor
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, FormsModule, CKEditorModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
})
export class PrivacyPolicyComponent implements OnInit {
  public Editor = ClassicEditor; // CKEditor instance

  content!: SafeHtml;
  loading = true;

  // مودال إضافة
  editorContent: string = ''; // محتوى المحرر
  selectedPageType: number = 1; // 1 -> Doctors, 2 -> Patients
  updating = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loadPrivacyPolicy();
  }

  selectedPageTypeChanged(value: any) {
    this.selectedPageType = Number(value); // <-- يحولها لـ number دايمًا
    this.loadPrivacyPolicy(this.selectedPageType);
  }

  loadPrivacyPolicy(pageType: number = 1) {
    this.loading = true;
    this.apiService.getStaticPage(pageType).subscribe({
      next: (res) => {
        this.content = this.sanitizer.bypassSecurityTrustHtml(res);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openModal(pageType: any) {
    this.selectedPageType = Number(pageType);
    this.editorContent = ''; // reset أول حاجة

    this.apiService.getStaticPage(pageType).subscribe({
      next: (res) => {
        this.editorContent = res || '';
      },
      error: () => {
        this.editorContent = '';
      },
    });
  }

  saveContent() {
    if (!this.editorContent!.trim()) return;

    const pageTypeNumber = Number(this.selectedPageType);

    this.updating = true;
    this.apiService
      .updateStaticPage(pageTypeNumber, this.editorContent)
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

  onEditorChange(event: any) {
    this.editorContent = event.editor.getData();
  }
}
