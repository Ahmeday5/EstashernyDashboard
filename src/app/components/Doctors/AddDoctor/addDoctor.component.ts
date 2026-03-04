import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';

// 🔥 الإضافات الجديدة للـ cropper
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-add-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  templateUrl: './addDoctor.component.html',
  styleUrls: ['./addDoctor.component.scss'],
})
export class addDoctorComponent implements OnInit {
  @ViewChild('form') form!: NgForm;
  @ViewChild('form', { static: false, read: ElementRef })
  formElement!: ElementRef<HTMLFormElement>;
  @ViewChild('doctorImage', { static: false })
  doctorImage!: ElementRef<HTMLInputElement>;
  @ViewChild('certUpload', { static: false })
  certUpload!: ElementRef<HTMLInputElement>;

  doctor = {
    name: '',
    email: '',
    phone: '',
    certificateFile: null as File | null,
    specializationId: '',
    doctorImageFile: null as File | null,
    nationalId: '',
    password: '',
    about: '',
    gender: '',
    experienceYears: '',
    doctorPercentage: '',
    consultationFee: '',
  };

  specializations: { id: number; name: string }[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  doctorImagePreview: string = '/assets/img/doctors/upload.png'; // متغير جديد لعرض الصورة المؤقتة
  certFileName: string | null = null; // متغير لعرض اسم الملف المرفوع

  // 🔥 متغيرات الـ Cropper الجديدة
  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl = '';
  tempCroppedBlob: Blob | null = null;
  showCropModal: boolean = false;

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer, // 🔥 ضروري للـ preview الآمن
  ) {}

  ngOnInit(): void {
    this.fetchSpecializations();
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

      // تحديث الـ preview الرئيسي
      this.doctorImagePreview = URL.createObjectURL(this.tempCroppedBlob);
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

    if (!this.doctor.doctorImageFile) {
      this.errorMessage = 'يرجى رفع صورة الدكتور ';
      this.cdr.detectChanges();
      return;
    }

    if (!this.doctor.certificateFile) {
      this.errorMessage = 'يرجى رفع شهادة الدكتور ';
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('Name', this.doctor.name);
    formData.append('Email', this.doctor.email);
    formData.append('Password', this.doctor.password);
    formData.append('DoctorImage', this.doctor.doctorImageFile || '');
    formData.append('DoctorCertificate', this.doctor.certificateFile || '');
    formData.append('Phone', this.doctor.phone);
    formData.append('NationalID', this.doctor.nationalId);
    formData.append('Specialization', this.doctor.specializationId);
    formData.append('ExamenPrice', this.doctor.consultationFee);
    formData.append('DoctorPersentage', this.doctor.doctorPercentage);
    formData.append('YearsOfExperience', this.doctor.experienceYears);
    formData.append('ProfileInfo', this.doctor.about);
    formData.append('Gender', this.doctor.gender);

    try {
      const response = await firstValueFrom(
        this.apiService.addDoctor(formData),
      );

      if (response.success) {
        this.successMessage = response.message; // "New Doctor Added Successfully"
        this.form.resetForm();
        this.doctor = {
          name: '',
          email: '',
          phone: '',
          certificateFile: null,
          specializationId: '',
          doctorImageFile: null,
          nationalId: '',
          password: '',
          about: '',
          gender: '',
          experienceYears: '',
          doctorPercentage: '',
          consultationFee: '',
        };
        this.doctorImagePreview = '/assets/img/doctors/upload.png'; // إعادة تعيين الصورة
        this.certFileName = null; // إعادة تعيين اسم الملف
        if (this.doctorImage) {
          this.doctorImage.nativeElement.value = '';
        }
        if (this.certUpload) {
          this.certUpload.nativeElement.value = '';
        }
        formElement.classList.remove('was-validated');
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      } else {
        this.errorMessage = response.message; // "Email is already registered"
      }
    } catch (error: any) {
      // التعامل مع الـ error اللي بيرجع من الـ Service
      let errorMessage = 'حدث خطأ أثناء الإرسال';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message; // "Email is already registered"
      } else if (
        error instanceof HttpErrorResponse &&
        error.error &&
        typeof error.error === 'string'
      ) {
        errorMessage = error.error; // "Email is already registered"
      }
      this.errorMessage = errorMessage;
      console.error('خطأ في إضافة الدكتور:', error);
    } finally {
      this.cdr.detectChanges();
    }
  }
}
