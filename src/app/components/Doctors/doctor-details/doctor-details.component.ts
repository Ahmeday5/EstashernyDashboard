import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-details.component.html',
  styleUrl: './doctor-details.component.scss',
})
export class DoctorDetailsComponent {
  doctor: any = {};
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isAdmin: boolean = false;
  selectedImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) {}
  //هنا هنستخدم الـ ActivatedRoute عشان نجيب الـ id من الـ URL، ونستدعي الـ API عشان نجيب بيانات الدكتور.

  ngOnInit() {
    this.loadDoctorDetails();
    this.checkRole(); // التحقق من الدور
  }

  checkRole() {
    const role = this.authService.getCurrentRole();
    this.isAdmin = role ? role.includes('Admin') : false;
  }
  
  loadDoctorDetails() {
    const id = this.route.snapshot.paramMap.get('id'); // استخراج الـ id من الـ URL
    if (id) {
      this.apiService.getDoctorById(+id).subscribe({
        next: (data) => {
          this.doctor = data;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'فشل في جلب بيانات الدكتور';
          this.loading = false;
          console.error('خطأ في جلب بيانات الدكتور:', error);
        },
      });
    } else {
      this.errorMessage = 'معرف الدكتور غير موجود';
      this.loading = false;
    }
  }

  // دالة للتحقق إذا كان الملف صورة
  isImage(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const extension = url.toLowerCase().substring(url.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }

  // دالة لفتح الصورة في Modal
  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl;
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('imageModal')
    );
    modal.show();
  }

  // دالة لحذف الدكتور مع تأكيد
  async onDelete() {
    if (!this.isAdmin) {
      alert('ليس لديك صلاحية لحذف الدكتور');
      return;
    }
    if (
      confirm('هل أنت متأكد من حذف الدكتور؟ هذا الإجراء لا يمكن التراجع عنه!')
    ) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        try {
          const response = await firstValueFrom(
            this.apiService.deleteDoctor(+id)
          );
          if (response.success) {
            this.router.navigate(['/alldoctor']); // التنقل فورًا بعد النجاح
            this.errorMessage = null; // مسح رسالة الخطأ
          } else {
            this.errorMessage = response.message || 'فشل في حذف الدكتور';
          }
        } catch (error) {
          this.errorMessage = 'فشل في حذف الدكتور';
          console.error('خطأ في حذف الدكتور:', error);
        }
      } else {
        this.errorMessage = 'معرف الدكتور غير موجود';
      }
    }
  }

  // دالة لتنشيط الدكتور مع تأكيد
  async activeDoc() {
    if (!this.isAdmin) {
      alert('ليس لديك صلاحية تنشيط الدكتور');
      return;
    }
    if (
      confirm('هل أنت متأكد من تنشيط الدكتور؟!')
    ) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        try {
          const response = await firstValueFrom(
            this.apiService.activeDoctor(+id)
          );
          if (response.success) {
            setTimeout(() => {
              this.successMessage = 'تم تنشيط الدكتور بنجاح';
            }, 1000);
            this.router.navigate(['/alldoctor']);
          } else {
            this.errorMessage = response.message || 'فشل في تنشيط الدكتور';
          }
        } catch (error) {
          this.errorMessage = 'فشل في تنشيط الدكتور';
          console.error('خطأ في تنشيط الدكتور:', error);
        }
      } else {
        this.errorMessage = 'معرف الدكتور غير موجود';
      }
    }
  }

  // دالة لحظر الدكتور مع تأكيد
  async inactiveDoc() {
    if (!this.isAdmin) {
      alert('ليس لديك صلاحية حظر الدكتور');
      return;
    }
    if (
      confirm('هل أنت متأكد من حظر الدكتور؟!')
    ) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        try {
          const response = await firstValueFrom(
            this.apiService.inactiveDoctor(+id)
          );
          if (response.success) {
            setTimeout(() => {
              this.successMessage = 'تم حظر الدكتور بنجاح';
            }, 1000);
            this.router.navigate(['/alldoctor']);
          } else {
            this.errorMessage = response.message || 'فشل في حظر الدكتور';
          }
        } catch (error) {
          this.errorMessage = 'فشل في حظر الدكتور';
          console.error('خطأ في حظر الدكتور:', error);
        }
      } else {
        this.errorMessage = 'معرف الدكتور غير موجود';
      }
    }
  }

  // دالة للذهاب لصفحة التعديل
  onEdit() {
    const id = this.route.snapshot.paramMap.get('id'); // جلب الـ id من الـ URL
    if (id) {
      this.router.navigate([`/edit-doctor/${id}`]); // توجيه لصفحة التعديل مع الـ id
    }
  }
}
