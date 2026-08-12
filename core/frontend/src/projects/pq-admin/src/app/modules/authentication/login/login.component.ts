import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/authentication/login.service';
import { DataService } from '../../../services/app/base/data.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastService } from 'pq-ui';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { UserService } from '../../../services/entities/user.service';
import { StorageService } from '../../../services/app/storage/storage.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';

const OTP_EXPIRY_DURATION = 300;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  userCredentials: { email: string, password: string } = { email: '', password: '' };
  csrfToken: string = '';
  loginForm: any;
  isLoggingIn: boolean = false;
  isOTPSent: boolean = false;
  isSendingOTP: boolean = false;
  userData: any;

  updatedMinutes: number = 0;
  otp: string = '';
  isOTPVerifying: boolean = false;
  isOTPVerified: boolean = false;
  isOTPExpired: boolean = false;
  isValidOTP: boolean = false;
  otpExpiryDuration = OTP_EXPIRY_DURATION;
  currentSeconds = 0;

  deviceType: any;
  deviceInfo: any;

  currentSection = 'login';
  isSendingResetOTP: boolean = false;
  isVerifyingOTP: boolean = false;
  isChangingPassword: boolean = false;
  captchaToken: string = '';

  constructor(
    private loginService: LoginService,
    private dataService: DataService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router,
    private toastService: ToastService,
    private userService: UserService,
    private storageService: StorageService,
    private recaptchaV3Service: ReCaptchaV3Service,
  ) { 
    localStorage.clear();
    setInterval(() => {
      this.updatedMinutes += 2;
    }, 20000);
  }

  async setTimerInterval() {
    this.currentSeconds = this.otpExpiryDuration;
    let expiry = setInterval(() => {
      if(this.currentSeconds <= 0) clearInterval(expiry);
      else this.currentSeconds--;
    }, 1000);
  }

  ngOnInit(): void {
    localStorage.clear();
    this.executeImportantAction();
  }

  sendOTP() {
    this.isSendingOTP = true;
    this.loginService.sendOTP(this.userCredentials.email).subscribe((res: any) => {
      this.isOTPSent = true;
      this.isSendingOTP = false;
      this.toastService.show('New OTP sent again to your email.', 'OTP sent', 'success', true);
      this.setTimerInterval();
    });
  }

  backToLogin() {
    localStorage.clear();
    this.isOTPSent = false;
    this.router.navigateByUrl('/login');
  }

  goToPage(page: string) {
    this.router.navigate([page]);
  }


  login() {
    this.isLoggingIn = true;
    const credentials = { email: this.userCredentials.email, password: this.userCredentials.password };
    this.http.post(`${env.api_production.hosts.accounts_server}/login-admin`, credentials).subscribe(
      (response: any) => {
        this.isLoggingIn = false;
        if(response && response.token) {
          this.userData = response.user;
          this.storageService.setItem('userdata', JSON.stringify(response.user));
          this.storageService.setItem('token', response.token);
          this.sendOTP();
        } else {
          this.toastService.show('Invalid credentials. Please try again.', 'Credentials mismatch', 'error', true);
        }
      },
      (error) => {
        this.isLoggingIn = false;
        this.toastService.show('Something went wrong. Our system admin will look into the issue.', 'Something went wrong.', 'error', true);
        console.error(error);
      }
    );
  }

  verifyOTP() {
    this.isOTPVerifying = true;
    if(!this.isOTPExpired) {
      this.loginService.verifyOTP(this.userCredentials.email, parseInt(this.otp)).subscribe((res: any) => {
        this.isOTPVerifying = false;
        if(res.status) {
          this.userData = res.user;
          this.storageService.setItem('userdata', JSON.stringify(res.user));
          this.storageService.setItem('token', res.token);
          this.setUserDataAndLogin();
        } else {
          this.toastService.show('OTP mismatch. Please try again.', 'OTP not verified', 'error', true);
        }
      });

    } else {
      this.toastService.show('The One-Time Passcode (OTP) has expired. Please generate new OTP.', 'OTP Expired', 'error', true);      
    }
  }

  setUserDataAndLogin() {
    this.toastService.show('Welcome to Client Dashboard.', 'Welcome', 'success', true);

    this.storageService.setItem('userdata', JSON.stringify(this.userData));
    this.toastService.show('Welcome to Client Portal.', 'OTP verified', 'success', true);
    this.isOTPVerified = true;
    this.storageService.setItem('otp_verified', true);
    this.storageService.setItem('login_date', new Date());
    this.getPermissions();
  }

  getPermissions() {
    const body = {
      role: this.storageService.getItem('userdata').role
    };
    this.userService.getPermissions(body).subscribe(res => {
      this.userService.userPermissions = res;
      this.storageService.setItem('permissions', res);
      if(res.dashboard && res.dashboard.read)
        this.router.navigateByUrl('/dashboard').then(() => window.location.reload());
      else if(res.connect_report && res.connect_report.read)
        this.router.navigateByUrl('/reports').then(() => window.location.reload());
      else if(res.newsletters && res.newsletters.read)
        this.router.navigateByUrl('/common/newsletters').then(() => window.location.reload());
      else if(res.it && res.it.read)
        this.router.navigateByUrl('/common/infotech-policies').then(() => window.location.reload());
      else 
        this.router.navigateByUrl('/system').then(() => window.location.reload());
    });
  }

  public executeImportantAction(): void {
    // this.recaptchaV3Service.execute('importantAction')
    //   .subscribe((token) => this.handleToken(token));
  }

  private handleToken(token: string): void {
    console.log('reCAPTCHA token:', token);
    // Handle the token received from reCAPTCHA
    this.captchaToken = token;
    this.loginService.verifyCaptchaToken(token).subscribe((response: any) => {
      if(response.status) {
        console.log('Captcha verified successfully', response);
      } else {
        console.error('Captcha verification failed', response);
        this.toastService.show('Captcha verification failed. Please try again.', 'Captcha Error', 'error', true);
      }
    }, (error) => {
      console.error('Captcha verification error:', error);
      this.toastService.show('An error occurred while verifying the captcha. Please try again.', 'Captcha Error', 'error', true);
    });
  }
}
