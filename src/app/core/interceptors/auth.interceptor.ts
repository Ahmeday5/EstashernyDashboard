import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  console.log('Interceptor يشتغل، URL:', req.url); // دايمًا بيطبع عشان نتاكد
  const token = localStorage.getItem('token'); // جلب التوكن مباشرة من localStorage
  let authReq = req;

  if (token) {
    console.log('توكن مضاف:', token); // طباعة التوكن
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token.trim()}`, // إضافة التوكن مع إزالة المسافات
      },
    });
  } else {
    console.log('لا توكن موجود في localStorage');
  }

  return next(authReq); // تمرير الطلب
};
