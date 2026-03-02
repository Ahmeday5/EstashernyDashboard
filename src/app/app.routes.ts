import { CanActivateFn, Routes } from '@angular/router';
import { SplashComponent } from './components/splash/splash.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { addDoctorComponent } from './components/Doctors/AddDoctor/addDoctor.component';
import { AlldoctorComponent } from './components/Doctors/AllDoctor/alldoctor.component';
import { DoctorDetailsComponent } from './components/Doctors/doctor-details/doctor-details.component';
import { EditDoctorComponent } from './components/Doctors/edit-doctor/edit-doctor.component';
import { SpecialitiesComponent } from './components/specialities/specialities.component';
import { DiscountComponent } from './components/discount/discount.component';
import { NotificationComponent } from './components/notification/notification.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AddUserComponent } from './components/Users/add-user/add-user.component';
import { AllUserComponent } from './components/Users/all-user/all-user.component';
import { PatientComponent } from './components/patient/patient.component';
import { AdvertisementsComponent } from './components/advertisements/advertisements.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { AuthService } from './services/auth.service';
import { map, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const canActivate: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    map((isLoggedIn) => {
      if (!isLoggedIn) {
        return router.createUrlTree(['/login']);
      }
      return true;
    }),
  );
};

export const canActivateRole: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['allowedRoles'] as string[]) || [];

  return authService.role$.pipe(
    map((roles) => {
      // إذا الدور موجود ومسموح → ادخل
      if (roles && allowedRoles.some((r) => roles.includes(r))) {
        return true;
      }

      // ممنوع → وجه لـ access-denied مع معرفة منين جاء
      return router.createUrlTree(['/access-denied'], {
        queryParams: { from: state.url },
      });
    }),
  );
};

export const routes: Routes = [
  {
    path: '',
    component: SplashComponent,
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        return authService.isLoggedIn$.pipe(
          map((isLoggedIn) => {
            if (!isLoggedIn) {
              return true;
            }

            // ↓↓↓ هنا الحل الأساسي ↓↓↓
            const roles = authService.getCurrentRole() as string[] | null;
            const userRoles: string[] = roles ?? []; // تأكيد أنها مصفوفة دائماً

            let targetPath = '/access-denied';

            if (userRoles.includes('Admin')) {
              targetPath = '/dashboard';
            } else if (
              userRoles.includes('Sales') ||
              userRoles.includes('Editor')
            ) {
              targetPath = '/alldoctor';
            } else if (userRoles.includes('Marketing')) {
              targetPath = '/Advertisements';
            }

            return router.createUrlTree([targetPath]);
          }),
        );
      },
    ],
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [canActivate],
    data: { breadcrumb: 'اللوحة الرئيسية', allowedRoles: ['Admin'] },
  },
  {
    path: 'adddoctor',
    component: addDoctorComponent,
    canActivate: [canActivate, canActivateRole],
    data: {
      breadcrumb: 'اضافة دكتور',
      allowedRoles: ['Admin', 'Editor', 'Sales'],
    },
  },
  {
    path: 'alldoctor',
    component: AlldoctorComponent,
    canActivate: [canActivate, canActivateRole],
    data: {
      breadcrumb: 'جميع الدكاترة',
      allowedRoles: ['Admin', 'Editor', 'Sales'],
    },
  },
  {
    path: 'doctor-details/:id',
    component: DoctorDetailsComponent,
    canActivate: [canActivate, canActivateRole],
    data: {
      breadcrumb: 'تفاصيل الدكتور',
      allowedRoles: ['Admin', 'Editor', 'Sales'],
    },
  },
  {
    path: 'edit-doctor/:id', // مسار جديد للتعديل
    component: EditDoctorComponent,
    canActivate: [canActivate, canActivateRole],
    data: {
      breadcrumb: 'تعديل الدكتور',
      allowedRoles: ['Admin', 'Editor', 'Sales'],
    },
  },
  {
    path: 'Specialities',
    component: SpecialitiesComponent,
    canActivate: [canActivate, canActivateRole],
    data: { breadcrumb: 'التخصصات', allowedRoles: ['Admin', 'Editor'] },
  },
  {
    path: 'discount',
    component: DiscountComponent,
    canActivate: [canActivate, canActivateRole],
    data: { breadcrumb: 'خصم', allowedRoles: ['Admin', 'Sales'] },
  },
  {
    path: 'notification',
    component: NotificationComponent,
    canActivate: [canActivate, canActivateRole],
    data: {
      breadcrumb: 'اشعار',
      allowedRoles: ['Admin', 'Editor', 'Marketing'],
    },
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [canActivate, canActivateRole],
    data: { breadcrumb: 'التقارير', allowedRoles: ['Admin'] },
  },
  {
    path: 'adduser',
    component: AddUserComponent,
    canActivate: [canActivate, canActivateRole],
    data: { breadcrumb: 'إضافة مستخدم', allowedRoles: ['Admin'] },
  },
  {
    path: 'alluser',
    component: AllUserComponent,
    canActivate: [canActivate, canActivateRole],
    data: { breadcrumb: 'جميع المستخدمين', allowedRoles: ['Admin'] },
  },
  {
    path: 'patient',
    component: PatientComponent,
    canActivate: [canActivate, canActivateRole],
    data: { breadcrumb: 'المرضي', allowedRoles: ['Admin', 'Editor'] },
  },
  {
    path: 'Advertisements',
    component: AdvertisementsComponent,
    canActivate: [canActivate, canActivateRole],
    data: {
      breadcrumb: 'الاعلانات',
      allowedRoles: ['Admin', 'Editor', 'Marketing'],
    },
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    canActivate: [canActivate, canActivateRole],
    data: { breadcrumb: 'سياسة الخصوصية', allowedRoles: ['Admin', 'Editor'] },
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
    canActivate: [canActivate], // لازم يكون مسجل دخول
  },
  { path: '**', redirectTo: '' },
];
