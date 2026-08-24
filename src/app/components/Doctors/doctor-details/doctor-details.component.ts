import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmModalService } from '../../../shared/components/confirm-modal/confirm-modal.service';

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
  isAdmin: boolean = false;
  selectedImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
    private toast: ToastService,
    private confirmModal: ConfirmModalService,
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
      this.toast.error('ليس لديك صلاحية لحذف الدكتور');
      return;
    }

    const confirmed = await this.confirmModal.confirm({
      title: 'حذف الدكتور',
      message: 'هل أنت متأكد من حذف الدكتور؟ هذا الإجراء لا يمكن التراجع عنه!',
      confirmLabel: 'حذف',
      tone: 'danger',
    });
    if (!confirmed) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toast.error('معرف الدكتور غير موجود');
      return;
    }

    try {
      const response = await firstValueFrom(this.apiService.deleteDoctor(+id));
      if (response.success) {
        this.toast.success('تم حذف الدكتور بنجاح');
        this.router.navigate(['/alldoctor']);
      } else {
        this.toast.error(response.message || 'فشل في حذف الدكتور');
      }
    } catch (error) {
      console.error('خطأ في حذف الدكتور:', error);
    }
  }

  // دالة لتنشيط الدكتور مع تأكيد
  async activeDoc() {
    if (!this.isAdmin) {
      this.toast.error('ليس لديك صلاحية تنشيط الدكتور');
      return;
    }

    const confirmed = await this.confirmModal.confirm({
      title: 'تنشيط الدكتور',
      message: 'هل أنت متأكد من تنشيط الدكتور؟',
      confirmLabel: 'تنشيط',
      tone: 'primary',
    });
    if (!confirmed) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toast.error('معرف الدكتور غير موجود');
      return;
    }

    try {
      const response = await firstValueFrom(this.apiService.activeDoctor(+id));
      if (response.success) {
        this.toast.success('تم تنشيط الدكتور بنجاح');
        this.router.navigate(['/alldoctor']);
      } else {
        this.toast.error(response.message || 'فشل في تنشيط الدكتور');
      }
    } catch (error) {
      console.error('خطأ في تنشيط الدكتور:', error);
    }
  }

  // دالة لحظر الدكتور مع تأكيد
  async inactiveDoc() {
    if (!this.isAdmin) {
      this.toast.error('ليس لديك صلاحية حظر الدكتور');
      return;
    }

    const confirmed = await this.confirmModal.confirm({
      title: 'حظر الدكتور',
      message: 'هل أنت متأكد من حظر الدكتور؟',
      confirmLabel: 'حظر',
      tone: 'warning',
    });
    if (!confirmed) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toast.error('معرف الدكتور غير موجود');
      return;
    }

    try {
      const response = await firstValueFrom(this.apiService.inactiveDoctor(+id));
      if (response.success) {
        this.toast.success('تم حظر الدكتور بنجاح');
        this.router.navigate(['/alldoctor']);
      } else {
        this.toast.error(response.message || 'فشل في حظر الدكتور');
      }
    } catch (error) {
      console.error('خطأ في حظر الدكتور:', error);
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
