import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { DataService } from '../app/base/data.service';
import { routes } from 'projects/pq-admin/src/environments/routes';

const ACCOUNTS_SERVER = env.api_production.hosts.accounts_server;
const REPORTS_SERVER = env.api_production.hosts.reports_server;
const API_LOGIN = `${ACCOUNTS_SERVER}/`;
const SEND_RESET_OTP = `${ACCOUNTS_SERVER}/send-reset-otp`;
const VERIFY_RESET_OTP = `${ACCOUNTS_SERVER}/verify-reset-otp`;

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private dataService: DataService
  ) { }

  doLogin(userCredentials: any) {
    return this.dataService.doPost(
      `${ACCOUNTS_SERVER}/login-admin`,
      userCredentials
    );
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

  verifyOTP(email: string, otp: number) {
    let body = {
      email: email,
      otp: otp
    };
    return this.dataService.doPost(
      `${ACCOUNTS_SERVER}/verify-otp`,
      body
    );
  }

  verifyCaptchaToken(token: string) {
    return this.dataService.doPost(
      `${ACCOUNTS_SERVER}/verify-captcha-token`,
      { captchaToken: token }
    );
  }
}
