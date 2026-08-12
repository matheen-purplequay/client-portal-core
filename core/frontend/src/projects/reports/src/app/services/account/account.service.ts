import { Injectable } from '@angular/core';
import { DataService } from '../app/data.service';
import { environment as env } from 'projects/reports/src/environments/environment';
import { LocalStorageService } from '../app/storage/local-storage.service';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const CHANGE_PASSWORD = `${ACCOUNTS_HOST}/change-password`;
const SEND_MESSAGE = `${ACCOUNTS_HOST}/send-message-test`;
const CHECK_LOGIN = `${ACCOUNTS_HOST}/check-login`;
const GET_PROFILE_PICTURES_PREVIEW = `${ACCOUNTS_HOST}/client/profile-pictures/preview`;
const GET_PROFILE_PICTURE_BY_USER_ID = `${ACCOUNTS_HOST}/profile/get-profile-picture-by-user-id`;
const SAVE_PROFILE_PICTURE = `${ACCOUNTS_HOST}/client/profile-picture/save`;
const SAVE_PROFILE_PHOTO = `${ACCOUNTS_HOST}/profile/save-profile-photo`;
const LOGOUT = `${ACCOUNTS_HOST}/logout`;

// Notificaiton settings
const SET_NOTIFICATION_SETTINGS = `${ACCOUNTS_HOST}/client/notifications/set-notification-settings`;
const GET_NOTIFICATION_SETTINGS = `${ACCOUNTS_HOST}/client/notifications/get-notification-settings`;

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(
    private dataService: DataService,
    private localStorageService: LocalStorageService
  ) { }

  sendMessage(body: any) {
    return this.dataService.doPost(SEND_MESSAGE, body);
  }

  checkUserLogin() {
    return this.dataService.doPost(`${CHECK_LOGIN}`, {});
  }

  getProfilePicturesPreview() {
    return this.dataService.doGet(`${GET_PROFILE_PICTURES_PREVIEW}`);
  }

  getProfilePictureByUserId(body: any) {
    return this.dataService.doPost(`${GET_PROFILE_PICTURE_BY_USER_ID}`, body);
  }

  saveProfilePicture(body: any) {
    return this.dataService.doPost(`${SAVE_PROFILE_PICTURE}`, body);
  }

  saveProfilePhoto(body: any, file: File, fileParam: string = 'photo') {
    return this.dataService.doUploadFormData(`${SAVE_PROFILE_PHOTO}`, body, file, fileParam);
  }
  
  changePassword(body: any) {
    return this.dataService.doPost(`${CHANGE_PASSWORD}`, body);
  }
  
  logoutUser() {
    return this.dataService.doGet(`${LOGOUT}`);
  }

  // Notification functions
  setNotificationSettings(body: any) {
    return this.dataService.doPost(`${SET_NOTIFICATION_SETTINGS}`, body);
  }
  
  getNotificationSettings(body: any) {
    return this.dataService.doPost(`${GET_NOTIFICATION_SETTINGS}`, body);
  }
}
