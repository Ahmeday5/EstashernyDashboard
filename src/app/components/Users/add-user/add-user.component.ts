import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  @ViewChild('form') form!: NgForm;
  @ViewChild('form', { static: false, read: ElementRef })
  formElement!: ElementRef<HTMLFormElement>;
  @ViewChild('userImage', { static: false })
  ProfileImage!: ElementRef<HTMLInputElement>;

  user = {
    FirstName: '',
    LastName: '',
    Email: '',
    Password: '',
    Phone: '',
    NationalID: '',
    Roles: '',
    ProfileImage: null as File | null,
  };

  doctorImagePreview: string = '/assets/img/doctors/upload.png'; // متغير جديد لعرض الصورة المؤقتة

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
  ) {}

  triggerFileInput(): void {
    console.log('Triggering user image input');
    this.ProfileImage.nativeElement.click();
  }

  onImageUpload(event: Event): void {
    console.log('Image upload triggered', event);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      console.log('Selected file:', input.files[0].name);
      this.user.ProfileImage = input.files[0];
      this.doctorImagePreview = URL.createObjectURL(this.user.ProfileImage); // تحديث الصورة المؤقتة
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

    if (!this.user.ProfileImage) {
      this.toast.error('يرجى رفع صورة المستخدم');
      return;
    }

    const formData = new FormData();
    formData.append('FirstName', this.user.FirstName);
    formData.append('LastName', this.user.LastName);
    formData.append('Email', this.user.Email);
    formData.append('Password', this.user.Password);
    formData.append('Phone', this.user.Phone);
    formData.append('NationalID', this.user.NationalID);
    formData.append('Roles', this.user.Roles);
    formData.append('ProfileImage', this.user.ProfileImage || '');

    try {
      const response = await firstValueFrom(this.apiService.addUser(formData));

      if (response.success) {
        this.toast.success(response.message || 'تم إضافة المستخدم بنجاح');
        this.form.resetForm();
        this.user = {
          FirstName: '',
          LastName: '',
          Email: '',
          Phone: '',
          ProfileImage: null,
          NationalID: '',
          Password: '',
          Roles: '',
        };
        this.doctorImagePreview = '/assets/img/doctors/upload.png'; // إعادة تعيين الصورة
        if (this.ProfileImage) {
          this.ProfileImage.nativeElement.value = '';
        }
        formElement.classList.remove('was-validated');
      } else {
        this.toast.error(response.message || 'فشل في إضافة المستخدم');
      }
    } catch (error: any) {
      console.error('خطأ في إضافة المستخدم:', error);
    } finally {
      this.cdr.detectChanges();
    }
  }
}
