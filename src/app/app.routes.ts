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
    })
  );
};

export const canActivateRole: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['allowedRoles'] as string[]) || [];

  return authService.role$.pipe(
    map((role) => {
      if (!role || !allowedRoles.some((r) => role.includes(r))) {
        return router.createUrlTree(['/dashboard']);
      }
      return true;
    })
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
            if (isLoggedIn) {
              return router.createUrlTree(['/dashboard']);
            }
            return true;
          })
        );
      },
    ],
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [canActivate],
    data: { breadcrumb: 'الرئيسية' },
  },
  {
    path: 'adddoctor',
    component: addDoctorComponent,
    canActivate: [canActivate],
    data: { breadcrumb: 'الطلبيات' },
  },
  {
    path: 'alldoctor',
    component: AlldoctorComponent,
    canActivate: [canActivate],
    data: { breadcrumb: 'الطلبيات' },
  },
  {
    path: 'doctor-details/:id',
    component: DoctorDetailsComponent,
    canActivate: [canActivate],
    data: { breadcrumb: 'المرتجعات' },
  },
  {
    path: 'edit-doctor/:id', // مسار جديد للتعديل
    component: EditDoctorComponent,
    canActivate: [canActivate],
    data: { breadcrumb: 'تعديل الدكتور' },
  },
  {
    path: 'Specialities',
    component: SpecialitiesComponent,
    canActivate: [canActivate],
    data: { breadcrumb: 'التخصصات' },
  },
  {
    path: 'discount',
    component: DiscountComponent,
    canActivate: [canActivate, canActivateRole],
    data: { breadcrumb: 'خصم', allowedRoles: ['Admin'] },
  },
  {
    path: 'notification',
    component: NotificationComponent,
    canActivate: [canActivate],
    data: { breadcrumb: 'اشعار' },
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
    data: { breadcrumb: 'المرضي', allowedRoles: ['Admin'] },
  },
  {
    path: 'Advertisements',
    component: AdvertisementsComponent,
    canActivate: [canActivate, canActivateRole],
    data: { breadcrumb: 'الاعلانات', allowedRoles: ['Admin'] },
  },
  { path: '**', redirectTo: '' },
];
