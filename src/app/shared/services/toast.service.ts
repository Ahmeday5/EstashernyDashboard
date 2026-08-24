import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastr = inject(ToastrService);

  success(message: string, title = 'تم بنجاح'): void {
    this.toastr.success(message, title);
  }

  error(message: string, title = 'حدث خطأ'): void {
    this.toastr.error(message, title);
  }

  warning(message: string, title = 'تنبيه'): void {
    this.toastr.warning(message, title);
  }

  info(message: string, title = 'معلومة'): void {
    this.toastr.info(message, title);
  }
}
