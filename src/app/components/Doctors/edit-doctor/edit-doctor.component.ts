import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

// 🔥 الإضافات الجديدة للـ cropper
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  templateUrl: './edit-doctor.component.html',
  styleUrl: './edit-doctor.component.scss',
})
export class EditDoctorComponent {
  @ViewChild('form') form!: NgForm;
  @ViewChild('form', { static: false, read: ElementRef })
  formElement!: ElementRef<HTMLFormElement>;
  @ViewChild('doctorImage', { static: false })
  doctorImage!: ElementRef<HTMLInputElement>;
  @ViewChild('certUpload', { static: false })
  certUpload!: ElementRef<HTMLInputElement>;

  isLoading: boolean = true;

  doctor: any = {
    id: '',
    name: '',
    email: '',
    phone: '',
    doctorImage: '/assets/img/doctors/upload.png',
    doctorImageFile: null,
    certificateFile: null,
    doctorCertificate: '',
    specialization: '',
    nationalID: '',
    password: '',
    profileInfo: '',
    gender: '',
    yearsOfExperience: '',
    doctorPersentage: '',
    examenPrice: '',
  };

  specializations: { id: number; name: string }[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  certFileName: string | null = null; // متغير لعرض اسم الملف المرفوع

  // 🔥 متغيرات الـ Cropper الجديدة
  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl = '';
  tempCroppedBlob: Blob | null = null;
  showCropModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer, // 🔥 ضروري للـ preview الآمن
  ) {}

  ngOnInit(): void {
    this.loadDoctorDetails();
    this.fetchSpecializations();
  }

  async loadDoctorDetails() {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        const data = await firstValueFrom(this.apiService.getDoctorById(+id));
        console.log('استجابة API:', data);
        this.doctor = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          doctorImage: this.getValidImageUrl(data.doctorImage),
          doctorImageFile: null,
          doctorCertificate: data.doctorCertificate || '',
          certificateFile: null,
          specialization: data.specialization,
          nationalID: data.nationalID,
          password: '',
          profileInfo: data.profileInfo,
          gender: data.gender,
          yearsOfExperience: data.yearsOfExperience,
          doctorPersentage: data.doctorPersentage,
          examenPrice: data.examenPrice,
        };
      } catch (error) {
        this.errorMessage = 'فشل في جلب بيانات الدكتور';
        console.error('خطأ في جلب بيانات الدكتور:', error);
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }
  }

  getValidImageUrl(imageUrl: string | null | undefined): string {
    const defaultImage = '/assets/img/doctors/upload.png';
    const validImageExtensions = ['.png', '.jpg', '.jpeg', '.jfif', '.webp']; // أضفت .jfif لأن الـ URL بيخلص بـ .jfif

    if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'null') {
      return defaultImage;
    }

    // التأكد من إزالة أي مسافات أو أحرف زايدة
    imageUrl = imageUrl.trim();

    // التحقق من إن اللينك فيه صيغة صالحة
    const isValidExtension = validImageExtensions.some((ext) =>
      imageUrl.toLowerCase().endsWith(ext),
    );
    return isValidExtension ? imageUrl : defaultImage;
  }

  async fetchSpecializations(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.apiService.getAllSpecialities(),
      );
      this.specializations = response || [];
    } catch (error) {
      console.error('فشل في جلب التخصصات:', error);
    }
  }

  triggerFileInput(): void {
    console.log('Triggering doctor image input');
    this.doctorImage.nativeElement.click();
  }

  triggerCertInput(): void {
    console.log('Triggering certificate input');
    this.certUpload.nativeElement.click();
  }

  // 🔥 الدالة الجديدة (بدل التحقق القديم من النسبة)
  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageChangedEvent = event; // 🔥 نبعت الحدث للـ cropper
      this.showCropModal = true; // 🔥 نفتح المودال فوراً
      this.doctor.doctorImageFile = null; // لسه ما اتقصش
      this.cdr.detectChanges();
    }
  }

  onCertUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.doctor.certificateFile = input.files[0];
      this.certFileName = input.files[0].name;
      input.value = '';
      this.cdr.detectChanges();
    }
  }

  // 🔥 الدوال الجديدة للـ Cropper
  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(
      event.objectUrl || '',
    );
    this.tempCroppedBlob = event.blob || null;
  }

  imageLoaded(image: LoadedImage): void {
    // الصورة اتحملت
  }

  loadImageFailed(): void {
    this.errorMessage = 'فشل تحميل الصورة، جرب صورة أخرى';
    this.showCropModal = false;
    this.cdr.detectChanges();
  }

  confirmCrop(): void {
    if (this.tempCroppedBlob) {
      const croppedFile = new File(
        [this.tempCroppedBlob],
        `doctor-image-${Date.now()}.png`,
        { type: 'image/png' },
      );
      this.doctor.doctorImageFile = croppedFile;

      // 🔥🔥🔥 التعديل الوحيد المطلوب 🔥🔥🔥
      this.doctor.doctorImage = URL.createObjectURL(this.tempCroppedBlob);

    }
    this.showCropModal = false;
    this.imageChangedEvent = null;
    this.cdr.detectChanges();
  }

  cancelCrop(): void {
    this.showCropModal = false;
    this.imageChangedEvent = null;
    this.doctorImage.nativeElement.value = ''; // نرجع الـ input فاضي
    this.cdr.detectChanges();
  }

  async handleSubmit(): Promise<void> {
    const formElement = this.formElement.nativeElement;
    if (!formElement.checkValidity()) {
      formElement.classList.add('was-validated');
      this.form.control.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('Id', this.doctor.id);
    formData.append('Name', this.doctor.name);
    formData.append('Email', this.doctor.email);
    formData.append('Phone', this.doctor.phone);
    formData.append('DoctorImage', this.doctor.doctorImageFile || '');
    formData.append('DoctorCertificate', this.doctor.certificateFile || '');
    formData.append('NationalID', this.doctor.nationalID);
    formData.append('Specialization', this.doctor.specialization);
    formData.append('ExamenPrice', this.doctor.examenPrice);
    formData.append('DoctorPersentage', this.doctor.doctorPersentage);
    formData.append('YearsOfExperience', this.doctor.yearsOfExperience);
    formData.append('ProfileInfo', this.doctor.profileInfo);
    formData.append('Gender', this.doctor.gender);
    if (this.doctor.password) {
      formData.append('Password', this.doctor.password);
    }

    try {
      const response = await firstValueFrom(
        this.apiService.updateDoctor(formData, this.doctor.id),
      );
      console.log('Response from API:', response);
      if (response.success) {
        this.successMessage = 'تم تحديث بيانات الدكتور بنجاح';
        setTimeout(
          () => this.router.navigate(['/doctor-details', this.doctor.id]),
          2000,
        );
      } else {
        this.errorMessage = 'فشل في تحديث بيانات الدكتور';
      }
    } catch (error: any) {
      let errorMessage = 'حدث خطأ أثناء التحديث';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message;
      } else if (
        error instanceof HttpErrorResponse &&
        error.error &&
        typeof error.error === 'string'
      ) {
        errorMessage = error.error;
      }
      this.errorMessage = errorMessage;
      console.error('خطأ في تحديث الدكتور:', error);
    }
  }
}
