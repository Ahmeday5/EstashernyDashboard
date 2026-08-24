import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './core/interceptors/auth.interceptor'; // تأكد إن المسار صحيح
import { errorToastInterceptor } from './core/interceptors/error-toast.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorToastInterceptor])), // تأكيد إن الـ Interceptor مضاف
    provideAnimations(),
    provideToastr({
      timeOut: 4000,
      positionClass: 'toast-top-left',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
      newestOnTop: true,
    }),
  ],
};
