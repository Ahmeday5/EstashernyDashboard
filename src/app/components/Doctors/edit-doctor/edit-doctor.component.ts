import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-edit-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
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
      imageUrl.toLowerCase().endsWith(ext)
    );
    return isValidExtension ? imageUrl : defaultImage;
  }

  async fetchSpecializations(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.apiService.getAllSpecialities()
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

  onImageUpload(event: Event): void {
    console.log('Image upload triggered', event);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      console.log('Selected file:', input.files[0].name);
      this.doctor.doctorImageFile = input.files[0];
      // لا تعين doctor.doctorImage هنا إلا لو كنت عايز تعرض الملف مؤقتًا
      input.value = '';
      this.cdr.detectChanges();
    }
  }

  onCertUpload(event: Event): void {
    console.log('Certificate upload triggered', event);
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      console.log('Selected file:', input.files[0].name);
      this.doctor.certificateFile = input.files[0];
      input.value = '';
      this.cdr.detectChanges();
    }
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
        this.apiService.updateDoctor(formData, this.doctor.id)
      );
      console.log('Response from API:', response);
      if (response.success) {
        this.successMessage = 'تم تحديث بيانات الدكتور بنجاح';
        setTimeout(
          () => this.router.navigate(['/doctor-details', this.doctor.id]),
          2000
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
