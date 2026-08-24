import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';

/**
 * Pulls the backend's own error message out of an HttpErrorResponse, whatever shape it
 * comes back in (plain-text body, `{ message }` JSON, or a validation `errors` map),
 * and falls back to a status-based message only when the server sent nothing usable.
 */
function extractBackendMessage(error: HttpErrorResponse): string {
  const body = error.error;

  if (typeof body === 'string' && body.trim()) {
    try {
      const parsed = JSON.parse(body);
      if (parsed?.message) return parsed.message;
    } catch {
      return body;
    }
  }

  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    if (body.errors && typeof body.errors === 'object') {
      const firstError = Object.values(body.errors).flat()[0];
      if (typeof firstError === 'string') return firstError;
    }
  }

  if (error.status === 0) return 'فشل الاتصال بالخادم. تحقق من الشبكة.';
  if (error.status === 401) return 'الجلسة منتهية، يرجى تسجيل الدخول مجددًا.';
  if (error.status === 403) return 'ليس لديك صلاحية لتنفيذ هذا الإجراء.';
  if (error.status === 404) return 'العنصر المطلوب غير موجود.';
  if (error.status >= 500) return 'حدث خطأ في الخادم، حاول مرة أخرى لاحقًا.';

  return 'حدث خطأ غير متوقع.';
}

export const errorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        toast.error(extractBackendMessage(error));
      }
      return throwError(() => error);
    }),
  );
};
