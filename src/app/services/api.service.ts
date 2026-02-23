import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  picture: string;
  nationalID: string;
  roles: string[];
  token: string | null;
  rememberMe?: boolean;
}

interface PatientResponse {
  total: number;
  page: number;
  pageSize: number;
  data: {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    birthday: string;
    imageUrl: string | null;
    dateOfCreation: string;
    isActive: boolean;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://37.34.238.190:9292/TheOneAPIEstasherny';

  constructor(private http: HttpClient) {}

  //login

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    // العائدة من الدالة هتبقى Observable من نوع any (يمكن نحدده لاحقًا زي { token: string })
    const loginUrl = `${this.baseUrl}/api/Dashboard/loginEmployee`;

    return this.http.post<LoginResponse>(loginUrl, credentials).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'حدث خطأ غير معروف';
        if (error.status === 0) {
          errorMessage = 'فشل الاتصال بالخادم. تحقق من الشبكة.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'بيانات الإدخال غير صحيحة.';
        } else if (error.status === 401) {
          errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
        } else if (error.status === 503) {
          errorMessage = 'الخادم غير متاح حاليًا. حاول لاحقًا.';
        }
        console.error('خطأ في تسجيل الدخول:', error);
        return throwError(() => ({
          status: error.status,
          message: errorMessage,
        }));
      }),
    );
  }

  /************************************************Dasboard****************************************************************/

  // الاند بوينتات الجديدة
  getTotalProfit(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/api/Dashboard/getTotalProfit`)
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب المبلغ الصافي:', error);
          return throwError(() => new Error('فشل جلب المبلغ الصافي'));
        }),
      );
  }

  getProfitToday(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/api/Dashboard/getProfitToday`)
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب الأرباح اليوم:', error);
          return throwError(() => new Error('فشل جلب الأرباح اليوم'));
        }),
      );
  }

  getTotalAppointmentsCount(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/api/Dashboard/getTotalAppointmentsCount`)
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب إجمالي المواعيد:', error);
          return throwError(() => new Error('فشل جلب إجمالي المواعيد'));
        }),
      );
  }

  getTodayAppointmentsCount(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/api/Dashboard/getTodayAppointmentsCount`)
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب مواعيد اليوم:', error);
          return throwError(() => new Error('فشل جلب مواعيد اليوم'));
        }),
      );
  }

  getTotalPatientsCount(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/api/Dashboard/getTotalPatientsCount`)
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب إجمالي المرضى:', error);
          return throwError(() => new Error('فشل جلب إجمالي المرضى'));
        }),
      );
  }

  getTodayPatientsCount(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/api/Dashboard/getTodayPatientsCount`)
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب مرضى اليوم:', error);
          return throwError(() => new Error('فشل جلب مرضى اليوم'));
        }),
      );
  }

  /***************************************************alldoctor************************************************************ */

  getAllSpecialities(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/api/Dashboard/getAllSpecialities`)
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب التخصصات:', error);
          return throwError(() => new Error('فشل جلب التخصصات'));
        }),
      );
  }

  // دالة جديدة لجلب كل الدكاترة
  getAllDoctors(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/api/Dashboard/getAllDoctors`)
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب كل الدكاترة:', error);
          return throwError(() => new Error('فشل جلب كل الدكاترة'));
        }),
      );
  }

  // دالة جديدة لجلب الدكاترة حسب التخصص
  getDoctorsBySpecialization(specialityName: string): Observable<any> {
    const url = `${this.baseUrl}/api/Dashboard/getDoctorsBySpecialization?specialization=${specialityName}`; // نزود الاسم كما هو بدون encodeURIComponent
    return this.http
      .get(url, { responseType: 'text' }) // نغير responseType لـ text
      .pipe(
        map((response) => {
          try {
            // حاول تحويل الاستجابة لـ JSON
            const parsedResponse = JSON.parse(response);
            // استخرج الـ data بس
            return parsedResponse.data || [];
          } catch (e) {
            // لو فيه خطأ (يعني نص)، رجّع مصفوفة فارغة
            return response === 'There is No Doctors with this specialization'
              ? []
              : [];
          }
        }),
        catchError((error) => {
          console.error(`خطأ في جلب الدكاترة بتاعين ${specialityName}:`, error);
          return throwError(
            () => new Error(`فشل جلب دكاترة ${specialityName}`),
          );
        }),
      );
  }

  searchByDoctorName(name: string): Observable<any> {
    const url = `${this.baseUrl}/api/Dashboard/searchByDoctorName?name=${name}`;
    return this.http.get<any>(url).pipe(
      // رجعنا لـ JSON بدل text
      map((response) => (Array.isArray(response) ? response : [])), // معالجة الـ array مباشرة
      catchError((error) => {
        console.error(`خطأ في البحث عن الاسم "${name}":`, error);
        return throwError(() => new Error(`فشل البحث عن الاسم "${name}"`));
      }),
    );
  }

  /***************************************************AddDoctor************************************************************ */

  addDoctor(formData: FormData): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/api/Dashboard/addDoctor`, formData, {
        responseType: 'text',
      })
      .pipe(
        map((response: string) => {
          if (response.includes('New Doctor Added Successfully')) {
            return { success: true, message: response };
          } else {
            return { success: false, message: response };
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('خطأ في إضافة الدكتور:', error);
          let errorMessage = 'حدث خطأ أثناء الإرسال';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error; // "Email is already registered"
          }
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  /***************************************************DoctorDetails************************************************************ */

  getDoctorById(id: number): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/api/Dashboard/getDoctor/${id}`)
      .pipe(
        catchError((error) => {
          console.error(`خطأ في جلب الدكتور ذو الـ ID ${id}:`, error);
          return throwError(() => new Error(`فشل جلب الدكتور ذو الـ ID ${id}`));
        }),
      );
  }

  // دالة جديدة لحذف الدكتور
  deleteDoctor(id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/api/Dashboard/deleteDoctor/${id}`, {
        responseType: 'text', // تعامل مع الاستجابة كـ نص
      })
      .pipe(
        map((response: string) => {
          // لو الطلب ناجح (200)، نفترض إن الحذف نجح
          return { success: true, message: response || 'تم حذف الدكتور بنجاح' };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(`خطأ في حذف الدكتور ذو الـ ID ${id}:`, error);
          let errorMessage = 'فشل في حذف الدكتور';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.status) {
            errorMessage = `خطأ ${error.status}: ${error.statusText}`;
          }
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  // دالة جديدة لتنشيط الدكتور
  activeDoctor(id: number): Observable<any> {
    return this.http
      .put(`${this.baseUrl}/api/Dashboard/activateDoctor/${id}`, null, {
        responseType: 'text',
      })
      .pipe(
        map((response: string) => {
          // لو الطلب ناجح (200)، نفترض إن التنشيط نجح
          return {
            success: true,
            message: response || 'تم تنشيط الدكتور بنجاح',
          };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(`خطأ في تنشيط الدكتور ذو الـ ID ${id}:`, error);
          let errorMessage = 'فشل في تنشيط الدكتور';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.status) {
            errorMessage = `خطأ ${error.status}: ${error.statusText}`;
          }
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  // دالة جديدة لحظر الدكتور
  inactiveDoctor(id: number): Observable<any> {
    return this.http
      .put(`${this.baseUrl}/api/Dashboard/deactivateDoctor/${id}`, null, {
        responseType: 'text',
      })
      .pipe(
        map((response: string) => {
          // لو الطلب ناجح (200)، نفترض إن التنشيط نجح
          return {
            success: true,
            message: response || 'تم  حظر الدكتور بنجاح',
          };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(`خطأ في حظر الدكتور ذو الـ ID ${id}:`, error);
          let errorMessage = 'فشل في حظر الدكتور';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.status) {
            errorMessage = `خطأ ${error.status}: ${error.statusText}`;
          }
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  /***************************************************EditDoctor************************************************************ */

  updateDoctor(formData: FormData, id: number): Observable<any> {
    return this.http
      .put(`${this.baseUrl}/api/Dashboard/updateDoctor/${id}`, formData, {
        responseType: 'text', // نص بسيط زي "Doctor updated successfully"
      })
      .pipe(
        map((response: string) => {
          // تحقق من الاستجابة بناءً على النص بدقة أكبر
          const lowerCaseResponse = response.toLowerCase().trim(); // تحويل لصغير وإزالة المسافات
          if (lowerCaseResponse.includes('doctor updated successfully')) {
            return { success: true, message: response }; // نجاح
          } else {
            return { success: false, message: response }; // فشل
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('خطأ في تحديث الدكتور:', error);
          let errorMessage = 'حدث خطأ أثناء التحديث';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.status) {
            errorMessage = `خطأ ${error.status}: ${error.statusText}`;
          }
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  /***************************************************Specialitie************************************************************ */
  addSpecialitie(data: { name: string; imageUrl: string }): Observable<any> {
    console.log('Body sent:', data);

    return this.http
      .post(`${this.baseUrl}/api/Dashboard/addSpecialty`, data)
      .pipe(
        map((response: any) => {
          // ✅ الرد الحقيقي من السيرفر
          return response?.message
            ? { success: true, message: response.message }
            : { success: false, message: 'Unknown response' };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('خطأ في إضافة التخصص:', error);
          let errorMessage = 'حدث خطأ أثناء الإرسال';
          if (error.error && typeof error.error === 'object') {
            errorMessage = error.error.message || errorMessage;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  deleteSpecialty(id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/api/Dashboard/deleteSpecialty/${id}`, {
        responseType: 'text', // السيرفر بيرجع نص
      })
      .pipe(
        map((response: string) => {
          let message = response;

          // ✅ نحاول نفك JSON لو السيرفر رجع نص بشكل JSON
          try {
            const parsed = JSON.parse(response);
            message = parsed.message || response;
          } catch (e) {
            // ignore - يعني الرد نص عادي مش JSON
          }

          const isSuccess =
            message.toLowerCase().includes('deleted successfully') ||
            message.toLowerCase().includes('specialty deleted successfully');

          return {
            success: isSuccess,
            message,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(`⚠️ خطأ في حذف التخصص ذو الـ ID ${id}:`, error);
          let errorMessage = 'حدث خطأ أثناء الحذف';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          }
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  /***************************************************discount************************************************************ */

  getAllDoctorsIDNameAndSpecialization(): Observable<any> {
    return this.http
      .get<any>(
        `${this.baseUrl}/api/Dashboard/getAllDoctorsIDNameAndSpecialization`,
      )
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب الدكاترة والتخصصات:', error);
          return throwError(() => new Error('فشل جلب الدكاترة والتخصصات'));
        }),
      );
  }

  // دالة لإضافة خصم على موعد
  applyDiscountToAppointment(params: {
    doctorId: number;
    date: string;
    discountPercentage: number;
  }): Observable<any> {
    // طباعة البيانات المرسلة للتحقق
    console.log('بيانات إضافة الخصم:', params);

    return this.http
      .post(
        `${this.baseUrl}/api/Dashboard/applyDiscountToAppointment`,
        params,
        {
          responseType: 'text', // الاستجابة نص
        },
      )
      .pipe(
        map((response: string) => {
          // تحليل الاستجابة
          try {
            const parsedResponse = JSON.parse(response); // محاولة تحويل النص لـ JSON
            if (
              parsedResponse.message.includes(
                'Discount applied and saved successfully',
              )
            ) {
              return {
                success: true,
                message: `تم تطبيق الخصم بنجاح. السعر الأصلي: ${parsedResponse.originalPrice}، نسبة الخصم: ${parsedResponse.discountPercentage}%، السعر بعد الخصم: ${parsedResponse.discountedPrice}`,
              };
            } else {
              return { success: false, message: parsedResponse.message };
            }
          } catch (e) {
            // لو الاستجابة نص مش JSON
            if (
              response.includes('No availability found for the specified date')
            ) {
              return {
                success: false,
                message: 'لا يوجد مواعيد متاحة في التاريخ المحدد',
              };
            }
            return { success: false, message: response };
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('خطأ في تطبيق الخصم:', error);
          let errorMessage = 'حدث خطأ أثناء تطبيق الخصم';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          }
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  /***************************************************Reports************************************************************ */

  // دالة جديدة لجلب أسماء الدكاترة
  getAllDoctorsNames(): Observable<{ doctorNames: string[]; message: string }> {
    return this.http
      .get<{
        doctorNames: string[];
        message: string;
      }>(`${this.baseUrl}/api/Dashboard/getAllDoctorsNames`)
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب أسماء الدكاترة:', error); // لو فيه خطأ، نطبعو
          return throwError(() => new Error('فشل جلب أسماء الدكاترة')); // نرجع خطأ
        }),
      );
  }

  // دالة جديدة لجلب بيانات الأرباح اليومية والشهرية مع فلترة
  getDoctorsDailyAndMonthlyProfit(params: {
    [key: string]: string;
  }): Observable<{ message: string; profits: any[] }> {
    // بنبني باراميترات الـ URL بناءً على الفلاتر (تاريخ، تخصص، اسم دكتور)
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        // لو الفلتر فيه قيمة، نضيفه
        httpParams = httpParams.set(key, params[key]);
      }
    });

    // نعمل طلب GET مع الباراميترات
    return this.http
      .get<{ message: string; profits: any[] }>(
        `${this.baseUrl}/api/Dashboard/getDoctorsDailyAndMonthlyProfit`,
        {
          params: httpParams, // نضيف الفلاتر هنا
        },
      )
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب بيانات الأرباح:', error); // لو فيه خطأ، نطبعو
          return throwError(() => new Error('فشل جلب بيانات الأرباح')); // نرجع خطأ
        }),
      );
  }

  /***************************************************adduser************************************************************ */

  addUser(formData: FormData): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/api/Dashboard/addEmployee`, formData, {
        responseType: 'text',
      })
      .pipe(
        map((response: string) => {
          if (response.includes('New Employee Added Successfully')) {
            return { success: true, message: response };
          } else {
            return { success: false, message: response };
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('خطأ في إضافة المستخدم:', error);
          let errorMessage = 'حدث خطأ أثناء الإرسال';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error; // "Email is already registered"
          }
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  /***************************************************alluser************************************************************ */

  getAllUser(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/api/Dashboard/getAllEmployees`)
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب كل المستخدمين:', error);
          return throwError(() => new Error('فشل جلب كل المستخدمين'));
        }),
      );
  }

  deleteUser(id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/api/Dashboard/deleteEmployee/${id}`, {
        responseType: 'text',
      })
      .pipe(
        map((response: string) => {
          return response.includes('employee Deleted Successfully')
            ? { success: true, message: response }
            : { success: false, message: response };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(`خطأ في حذف التخصص ذو الـ ID ${id}:`, error);
          let errorMessage = 'حدث خطأ أثناء الحذف';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          }
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  /***********************************patient*****************************************/

  // دالة للبحث عن المرضى بالاسم مع دعم الباجنيشن
  searchPatientsByName(
    name: string = '',
    page: number = 1,
    pageSize: number = 10,
  ): Observable<PatientResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (name.trim()) {
      params = params.set('name', name);
    }

    const url = `${this.baseUrl}/api/Dashboard/searchPatientsByName`;
    return this.http.get<PatientResponse>(url, { params }).pipe(
      map((response) => ({
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        data: Array.isArray(response.data) ? response.data : [],
      })),
      catchError((error: HttpErrorResponse) => {
        console.error(`خطأ في البحث عن المرضى "${name}":`, error);
        let errorMessage = 'فشل البحث عن المرضى';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        }
        return throwError(() => ({ success: false, message: errorMessage }));
      }),
    );
  }

  /***************************************************Advertisements************************************************************ */
  addAdvertisements(data: { Title: string; ImageFile: File }): Observable<any> {
    const formData = new FormData();
    formData.append('Title', data.Title);
    formData.append('ImageFile', data.ImageFile); // ⚠️ الاسم لازم يطابق السيرفر

    return this.http
      .post(`${this.baseUrl}/api/Dashboard/addAdvertisement`, formData, {
        responseType: 'text', // <--- هنا نقولله النص عادي
      })
      .pipe(
        map((response: string) => ({
          success: true,
          message: response || 'تم الإرسال',
        })),
        catchError((error: HttpErrorResponse) => {
          console.error('خطأ في إضافة الاعلان:', error);
          let errorMessage = 'حدث خطأ أثناء الإرسال';
          if (error.status === 0) errorMessage = 'مشكلة في الاتصال بالسيرفر';
          else if (error.status === 401 || error.status === 403)
            errorMessage = 'الجلسة انتهت، برجاء تسجيل الدخول مجدداً';
          else if (error.status === 404) errorMessage = 'الطلب غير موجود';
          else if (error.status >= 500)
            errorMessage = 'مشكلة في السيرفر، حاول بعد شوية';
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  getAllAdvertisements(
    page: number = 1,
    pageSize: number = 5,
  ): Observable<any> {
    return this.http
      .get<any>(
        `${this.baseUrl}/api/Dashboard/getAllAdvertisements?page=${page}&pageSize=${pageSize}`,
      )
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب الإعلانات:', error);
          return throwError(() => new Error('فشل جلب الإعلانات'));
        }),
      );
  }

  deleteAdvertisements(id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/api/Dashboard/deleteAdvertisement/${id}`, {
        responseType: 'text', // السيرفر بيرجع نص
      })
      .pipe(
        map((response: string) => {
          let message = response;

          // ✅ نحاول نفك JSON لو السيرفر رجع نص بشكل JSON
          try {
            const parsed = JSON.parse(response);
            message = parsed.message || response;
          } catch (e) {
            // ignore - يعني الرد نص عادي مش JSON
          }

          const isSuccess =
            message.toLowerCase().includes('deleted successfully') ||
            message.toLowerCase().includes('specialty deleted successfully');

          return {
            success: isSuccess,
            message,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(`⚠️ خطأ في حذف التخصص ذو الـ ID ${id}:`, error);
          let errorMessage = 'حدث خطأ أثناء الحذف';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          }
          return throwError(() => ({ success: false, message: errorMessage }));
        }),
      );
  }

  /***************************************************Privacy Policy********************************************************/

  // جلب صفحة ثابتة
  getStaticPage(pageType: number): Observable<string> {
    const url = `${this.baseUrl}/api/Dashboard/getStaticPage?pageType=${pageType}`;
    return this.http.get(url, { responseType: 'text' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('خطأ في جلب الصفحة الثابتة:', error);
        return throwError(() => new Error('فشل تحميل الصفحة'));
      }),
    );
  }

  // تحديث صفحة ثابتة
  updateStaticPage(pageType: number, content: string): Observable<any> {
    const url = `${this.baseUrl}/api/Dashboard/updateStaticPage`;
    const body = { pageType, content };
    return this.http.put(url, body, { responseType: 'text' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('خطأ في تحديث الصفحة الثابتة:', error);
        return throwError(() => ({
          success: false,
          message: 'فشل تحديث الصفحة',
        }));
      }),
    );
  }
}
