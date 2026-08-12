import { Injectable, NgZone } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { DataService } from '../base/data.service';
import { StorageService } from '../storage/storage.service';
import { ToastService } from 'pq-ui';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { Observable } from 'rxjs';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;
const SAVE_TOKEN = `${ACCOUNTS_HOST}/client/notifications/save-token`;
const GET_NOTIFICATIONS = `${ACCOUNTS_HOST}/client/notifications/get-notifications`;
const SEND_TEST_NOTIFICATION = `${ACCOUNTS_HOST}/client/notifications/send-notification`;
const NOTIFICATION_STREAM = `${ACCOUNTS_HOST}/client/notifications/stream`;
const DELETE_NOTIFICATION = `${ACCOUNTS_HOST}/client/notifications/delete-notification`;


@Injectable({
  providedIn: 'root'
})
export class CloudMessagingService {

  public token = '';

  constructor(
    private afMessaging: AngularFireMessaging,
    private dataService: DataService,
    private storageService: StorageService,
    private ngZone: NgZone,
    private toastService: ToastService
  ) {}    

  requestPermission() {

    this.afMessaging.requestToken.subscribe(
      (token) => {

        this.storageService.setItem('dt', token);
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

      this.storageService.setItem('dt', res);
      this.dataService.doPost(`${SAVE_TOKEN}`, {
        user_id: user_id,
        device_token: res
      }).subscribe({
        next: (res: any) => {

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
      user_id: this.storageService.getItem('userdata').user_id
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
    const body = {
      user_id: this.storageService.getItem('userdata').user_id,
      app_id: 1, 
      sub_app_id: 1,
      title: 'Test Notification',
      body: 'Test notification',
      type: 'alert'
    };
    return this.dataService.doPost(`${SEND_TEST_NOTIFICATION}`, body);
  }

  deleteNotification(body: any) {
    return this.dataService.doPost(`${DELETE_NOTIFICATION}`, body);
  }
}
