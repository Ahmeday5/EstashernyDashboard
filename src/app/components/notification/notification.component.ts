import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
  title: string = '';
  body: string = '';
  topic: string = 'patient'; // الافتراضي
  imageUrl: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  isValidImageUrl(url: string): boolean {
    if (!url) return true; // فاضي يبقى تمام
    // يتأكد من https وامتداد الصورة قبل أي ? أو نهاية الرابط
    const pattern = /^https:\/\/.*\.(jpg|jpeg|png)(\?.*)?$/i;
    return pattern.test(url);
  }

  async sendNotification() {
    this.successMessage = '';
    this.errorMessage = '';

    // تحقق من رابط الصورة
    if (!this.isValidImageUrl(this.imageUrl)) {
      this.errorMessage =
        'رابط الصورة غير صالح. يجب أن يبدأ بـ https وينتهي بـ jpg أو jpeg أو png';
      return;
    }

    this.isLoading = true;

    try {
      const response = await firstValueFrom(
        this.http.post<any>(
          'http://37.34.238.190:9292/TheOneAPIEstasherny/api/notification/send',
          {
            title: this.title,
            body: this.body,
            topic: this.topic,
            imageUrl: this.imageUrl,
          },
        ),
      );
      console.log('Notification sent:', response);
      this.successMessage = 'تم إرسال الإشعار بنجاح';
      setTimeout(() => {
        this.successMessage = '';
        // 👇 تفريغ الحقول بعد النجاح
        this.title = '';
        this.body = '';
        this.topic = 'patient';
        this.imageUrl = '';
      }, 2000);
    } catch (error: any) {
      console.error('Error sending notification:', error);
      this.errorMessage = 'فشل في إرسال الإشعار';
    } finally {
      this.isLoading = false;
    }
  }
}
