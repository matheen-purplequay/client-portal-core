import { Injectable } from '@angular/core';
import { DataService } from '../app/data.service';
import { environment as env } from 'projects/reports/src/environments/environment';
import { LocalStorageService } from '../app/storage/local-storage.service';

const ACCOUNTS_SERVER = env.api_production.hosts.accounts_server;
const REPORTS_SERVER = env.api_production.hosts.reports_server;
const API_LOGIN = `${ACCOUNTS_SERVER}/`;
const SEND_RESET_OTP = `${ACCOUNTS_SERVER}/send-reset-otp`;
const VERIFY_RESET_OTP = `${ACCOUNTS_SERVER}/verify-reset-otp`;
const CHANGE_PASSWORD = `${ACCOUNTS_SERVER}/change-password`;
const CHECK_LOGIN = `${ACCOUNTS_SERVER}/check-login`;
const GET_CLIENTS = `${ACCOUNTS_SERVER}/get/clients`;
const GET_CLIENTS_BY_MASTER = `${ACCOUNTS_SERVER}/get/clients-by-master`;
const GET_CLIENT = `${ACCOUNTS_SERVER}/get/client`;
const GET_LOGIN_ACTIVITIES = `${ACCOUNTS_SERVER}/client/get-login-activity`;
const SET_STAGING_ENV = `${ACCOUNTS_SERVER}/client/set-staging-env`;

const ONE_TIME_LOGIN = `${ACCOUNTS_SERVER}/one-time-login`;

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private isAuthenticated = false;
  private authSecretKey = 'token';

  constructor(
    private dataService: DataService,
    private localStorageService: LocalStorageService
  ) { 
    this.isAuthenticated = !!this.localStorageService.getItem(this.authSecretKey);
  }

  isAuthenticatedUser(): boolean {
    return this.isAuthenticated;
  }

  doLogin(userCredentials: any) {
    return this.dataService.doPost(
      `${ACCOUNTS_SERVER}/get-token`,
      userCredentials
    );
  }

  oneTimeLogin(body: any) {
    return this.dataService.doPost(`${ONE_TIME_LOGIN}`, body);
  }

  setStagingEnv() {
    return this.dataService.doGet(`${SET_STAGING_ENV}`);
  }

  sendOTP(email: string) {
    let body = {
      email: email
    };

    return this.dataService.doPost(
      `${ACCOUNTS_SERVER}/send-otp`,
      body
    );
  }

  verifyOTP(body: any) {
    return this.dataService.doPost(
      `${ACCOUNTS_SERVER}/verify-otp`,
      body
    );
  }

  sendResetOTP(body: any) {
    return this.dataService.doPost(`${SEND_RESET_OTP}`, body);
  }

  verifyResetOTP(body: any) {
    return this.dataService.doPost(`${VERIFY_RESET_OTP}`, body);
  }

  changePassword(body: any) {
    return this.dataService.doPost(`${CHANGE_PASSWORD}`, body);
  }

  getClients() {
    return this.dataService.doGet(`${GET_CLIENTS}`);
  }

  getClientsByMaster(body: any) {
    return this.dataService.doPost(`${GET_CLIENTS_BY_MASTER}`, body);
  }

  getClient(body: any) {
    return this.dataService.doPost(`${GET_CLIENT}`, body);
  }

  getLoginActivities(body: any) {
    return this.dataService.doPost(`${GET_LOGIN_ACTIVITIES}`, body);
  }

  verifyCaptchaToken(token: string) {
    return this.dataService.doPost(
      `${ACCOUNTS_SERVER}/verify-captcha-token`,
      { captchaToken: token }
    );
  }
}
