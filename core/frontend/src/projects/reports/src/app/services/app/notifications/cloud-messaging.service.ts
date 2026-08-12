import { Injectable, NgZone } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { AngularFireModule } from '@angular/fire/compat';
import { mergeMapTo } from 'rxjs/operators';
import { environment as env } from 'projects/reports/src/environments/environment';
import { DataService } from '../data.service';
import { LocalStorageService } from '../storage/local-storage.service';
import { from, Observable } from 'rxjs';
import { ToastService } from 'pq-ui';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;
const SAVE_TOKEN = `${ACCOUNTS_HOST}/client/notifications/save-token`;
const GET_NOTIFICATIONS = `${ACCOUNTS_HOST}/client/notifications/get-notifications`;
const SEND_TEST_NOTIFICATION = `${ACCOUNTS_HOST}/client/notifications/send-notification`;
const NOTIFICATION_STREAM = `${ACCOUNTS_HOST}/client/notifications/stream`;
const DELETE_NOTIFICATION = `${ACCOUNTS_HOST}/client/notifications/delete-notification`;

interface Notification {
  title: string;
  body: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudMessagingService {

  public token = '';

  constructor(
    private afMessaging: AngularFireMessaging,
    private dataService: DataService,
    private localStorageService: LocalStorageService,
    private ngZone: NgZone,
    private toastService: ToastService
  ) {}

  requestPermission() {
    console.log('requesting notification permission');
    this.afMessaging.requestToken.subscribe(
      (token) => {
        console.log('Permission granted! Save the token:', token);
        this.localStorageService.setItem('dt', token);
      },
      (error) => {
        console.error('Permission denied', error);
      }
    );
  }

  getToken() {
    return this.afMessaging.getToken;
  }

  saveToken(user_id: number) {
    this.afMessaging.getToken.subscribe((res) => {
      console.log('token received ', res);
      this.localStorageService.setItem('dt', res);
      this.dataService.doPost(`${SAVE_TOKEN}`, {
        user_id: user_id,
        device_token: res
      }).subscribe({
        next: (res: any) => {
          console.log('Token saved to database', res);
        },
        error: (err :any) => {
          console.error('Error saving token to database', err);
        }
      });
    });
  }

  receiveMessage() {
    this.afMessaging.messages.subscribe(
      (message) => {
        console.log('Message received:', message);
        const notificationTitle = message.notification?.title;
        const notificationOptions = {
          body: message.notification?.body,
          icon: '/default-icon.png' // Specify default icon if needed
        };


        if(message.notification?.title && message.notification.body) {
          if (document.hasFocus()) {
            this.toastService.show(message.notification?.body, message.notification?.title, 'success', true);
          } else {
            if (Notification.permission === 'granted') {
              new Notification(notificationTitle!, notificationOptions);
            }
          }
        }
      }
    );
  }

  getNotifications() {
    const body = {
      user_id: this.localStorageService.getItem('userdata').user_id
    };

    return this.dataService.doPost(`${GET_NOTIFICATIONS}`, body);
  }

  getNotificationStream(userId: string): Observable<Notification> {
    return new Observable((observer) => {
      const eventSource = new EventSource(`${NOTIFICATION_STREAM}?user_id=${userId}`);

      eventSource.onmessage = (event) => {
        // Parse the received data
        const notification: Notification = JSON.parse(event.data);

        // Use NgZone to run outside of Angular's zone to prevent change detection issues
        this.ngZone.run(() => {
          observer.next(notification);
        });
      };

      eventSource.onerror = (error) => {
        // Log the error and close the connection
        // console.error('SSE error:', error);
        eventSource.close();
        // observer.error(error);
      };

      return () => {
        // Cleanup when the observable is unsubscribed
        eventSource.close();
      };
    });
  }

  sendTestNotification() {
    if(this.localStorageService.getItem('userdata').is_tester) {
      const body = {
        user_id: this.localStorageService.getItem('userdata').user_id,
        app_id: 1, 
        sub_app_id: 1,
        title: 'Test Notification',
        body: 'Test notification',
        type: 'alert'
      };
      return this.dataService.doPost(`${SEND_TEST_NOTIFICATION}`, body);
    } else return null;
  }

  deleteNotification(body: any) {
    return this.dataService.doPost(`${DELETE_NOTIFICATION}`, body);
  }
}
