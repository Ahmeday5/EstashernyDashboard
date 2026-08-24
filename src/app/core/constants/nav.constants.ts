import { NavSection } from './nav.model';

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'الرئيسية',
    items: [
      {
        id: 'dashboard',
        label: 'الرئيسية',
        route: '/dashboard',
        icon: 'home',
        allowedRoles: ['Admin'],
      },
    ],
  },
  {
    label: 'الطاقم الطبي',
    items: [
      {
        id: 'doctors',
        label: 'دكتور',
        icon: 'doctor',
        allowedRoles: ['Admin', 'Editor', 'Sales'],
        children: [
          { id: 'doctors-list', label: 'جميع الأطباء', route: '/alldoctor', icon: 'doctor-list' },
          { id: 'doctors-add', label: 'إنشاء حسابات الأطباء', route: '/adddoctor', icon: 'doctor-add' },
        ],
      },
      {
        id: 'specialities',
        label: 'التخصصات',
        route: '/Specialities',
        icon: 'specialities',
        allowedRoles: ['Admin', 'Editor'],
      },
      {
        id: 'patients',
        label: 'المرضى',
        route: '/patient',
        icon: 'patients',
        allowedRoles: ['Admin', 'Editor'],
      },
    ],
  },
  {
    label: 'الإدارة',
    items: [
      {
        id: 'users',
        label: 'المستخدمين',
        icon: 'users',
        allowedRoles: ['Admin'],
        children: [
          { id: 'users-list', label: 'المستخدمين', route: '/alluser', icon: 'users' },
          { id: 'users-add', label: 'إضافة مستخدم جديد', route: '/adduser', icon: 'user-add' },
        ],
      },
      {
        id: 'reports',
        label: 'التقارير',
        route: '/reports',
        icon: 'reports',
        allowedRoles: ['Admin'],
      },
      {
        id: 'discount',
        label: 'إضافة خصم',
        route: '/discount',
        icon: 'discount',
        allowedRoles: ['Admin', 'Sales'],
      },
    ],
  },
  {
    label: 'التسويق',
    items: [
      {
        id: 'notifications',
        label: 'الإشعارات',
        route: '/notification',
        icon: 'bell',
        allowedRoles: ['Admin', 'Editor', 'Marketing'],
      },
      {
        id: 'advertisements',
        label: 'الاعلانات',
        route: '/Advertisements',
        icon: 'megaphone',
        allowedRoles: ['Admin', 'Editor', 'Marketing'],
      },
    ],
  },
  {
    label: 'أخرى',
    items: [
      {
        id: 'privacy-policy',
        label: 'سياسة الخصوصية',
        route: '/privacy-policy',
        icon: 'shield',
        allowedRoles: ['Admin', 'Editor'],
      },
    ],
  },
];
