import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataService } from '../../../services/app/data.service';
import { LoginService } from '../../../services/authentication/login.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'pq-ui';
import { environment as env } from 'projects/reports/src/environments/environment';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { ConfigService } from '../../../services/app/config.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {

  @Output() masterCompanyLoginFormLoaded: EventEmitter<boolean> = new EventEmitter();
  @Output() isOTPSent: EventEmitter<string> = new EventEmitter();

  userCredentials: { email: string, password: string } = { email: '', password: '' };
  csrfToken: string = '';
  loginForm: any;
  isLoggingIn: boolean = false;

  updatedMinutes: number = 0;

  currentSection = 'login';
  resetOTP: number | null = 0;
  isSendingResetOTP: boolean = false;
  isVerifyingOTP: boolean = false;
  isChangingPassword: boolean = false;

  confirmPassword: string = '';
  otpSeconds = 0;
  company: string = '';

  @Input() masterCompany: any;
  isMasterCompanyLoading: boolean = false;
  isMasterCompanyAvailable: boolean = false;
  captchaToken: string = '';

  isValidEmail: boolean = false;
  isValidPassword: boolean = false;

  constructor(
    private loginService: LoginService,
    private dataService: DataService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router,
    private toastService: ToastService,
    private localStorageService: LocalStorageService,
    private activatedRoute: ActivatedRoute,
    private configService: ConfigService,
    private recaptchaV3Service: ReCaptchaV3Service,
  ) { 
    setInterval(() => {
      this.updatedMinutes += 2;
    }, 20000);
    
    if(this.localStorageService.isItemExists('localversion')) {
      const localVersion = this.localStorageService.getItem('localversion');
      localStorage.clear();
      this.localStorageService.setItem('localversion', localVersion);
    } else localStorage.clear();
    
    this.localStorageService.setItem('otp_verified', false);
    const master_company = window.location.href;

    if(master_company.includes('purplequay.com.au') && sessionStorage.getItem('master_company') == 'pq') {
      this.getMasterCompany();
    } else if(!master_company.includes('purplequay.com.au') && sessionStorage.getItem('master_company') == 'pq') {
      sessionStorage.clear();
    } else if (master_company.includes('purplequay.com.au') && sessionStorage.getItem('master_company') === null) {
      this.getMasterCompany();
    } else {
      sessionStorage.clear();
    }
  }

  getMasterCompany() {
    this.isMasterCompanyAvailable = true;
    this.isMasterCompanyLoading = true;

    sessionStorage.setItem('master_company', 'pq');
    this.localStorageService.setItem('master_company', 'pq');
    const body = {
      short_name: 'pq'
    };
    this.configService.getMasterCompany(body).subscribe((res: any) => {
      this.masterCompanyLoginFormLoaded.emit(true);
      this.isMasterCompanyLoading = false;
      document.documentElement.style.setProperty('--primary-color', res.data.primary_color);
    });
  }

  ngOnInit(): void {
    this.executeImportantAction();
    // const token = this.dataService.getToken().subscribe((res: any) => {
    //   console.log('api token ', res);
    //   if(res) {
    //     this.dataService.doGet(`http://10.10.31.50:8001/set-token/${res[0]}/${res[1]}`).subscribe((res: any) => {
    //       console.log('after saving token ', res);
    //     });
    //   }
    // });
  }

  checkIfUserAuthenticated() {
    
  }

  demoLogin(email: string, password: string) {
    this.userCredentials.email = email;
    this.userCredentials.password = password;
    this.login();
  }

  validateCredentials(): boolean {
    let flag = true;
    if(this.validateEmail()) {
      flag = false; this.toastService.show('Please fill email address and try again.', 'Need email address', 'warning', true);
    } else if (this.validatePassword()) {
      flag = false; this.toastService.show('Please fill password and try again.', 'Need password', 'warning', true);
    }
    return flag;
  }

  validateEmail(): boolean {
    this.isValidEmail = !this.userCredentials.email;
    return this.isValidEmail;
  }

  validatePassword(): boolean {
    this.isValidPassword = !this.userCredentials.password;
    return this.isValidPassword;
  }

  login() {
    if(!this.validateCredentials()) return;
    this.isLoggingIn = true;
    const credentials = { email: this.userCredentials.email, password: this.userCredentials.password, captchaToken: this.captchaToken };
    this.http.post(`${env.api_production.hosts.accounts_server}/get-token`, credentials).subscribe(
      (response: any) => {
        console.log('token from auth ', response);
        this.isLoggingIn = false;
        if(response && response.token) {
          this.toastService.show(' An OTP has been sent to your email address. Please check your inbox.', 'OTP sent to email', 'success', true);
          this.localStorageService.setItem('userdata', JSON.stringify(response.user));
          this.localStorageService.setItem('token', response.token);
          // this.router.navigateByUrl('/otp');
          this.isOTPSent.emit(this.userCredentials.email);
          // this.router.navigate(['dashboard']);
        } else {
          if(response && response.error)
            this.toastService.show(response.error.message, response.error.title, 'warning', true);
          else
            this.toastService.show('Something technical error occured while logging in. Please report it to concerned admin.', 'Something went wrong', 'error', true);
        }
      },
      (error) => {
        this.isLoggingIn = false;
        this.toastService.show('Something went wrong. Our system admin will look into the issue.', 'Something went wrong.', 'error', true);
        console.error(error);
      }
    );
  }

  sendResetOTP() {
    if(this.userCredentials.email == '') {
      this.toastService.show('Please enter your email address to send OTP for password reset.', 'Email required', 'warning', true);
      return;
    }
    this.isSendingResetOTP = true;
    const body = {
      email: this.userCredentials.email
    };
    this.loginService.sendResetOTP(body).subscribe((data: any) => {
      this.isSendingResetOTP = false;
      console.log('send reset otp response ', data);
      this.toastService.show('OTP for reset password sent to your email.', 'OTP sent', 'success', true);
      this.currentSection = 'verify';
    });
  }

  verifyResetOTP() {
    if(this.resetOTP != 0 || this.resetOTP != null) {
      this.isVerifyingOTP = true;
      const body = {
        email: this.userCredentials.email,
        otp: this.resetOTP
      };
      this.loginService.verifyResetOTP(body).subscribe((data: any) => {
        this.isVerifyingOTP = false;
        console.log('send reset otp response ', data);
        this.currentSection = 'change';
      });
    } else {
      this.toastService.show('The One-Time Password (OTP) is incorrect. Please verify and try again.', 'Invalid OTP', 'error', true);
    }
  }

  changePassword() {
    if(this.userCredentials.password == this.confirmPassword) {
      this.isChangingPassword = true;
      const body = {
        email: this.userCredentials.email,
        password: this.userCredentials.password
      };
      this.loginService.changePassword(body).subscribe((data: any) => {
        this.isChangingPassword = false;
        console.log('send reset otp response ', data);
        this.clearResetPassword();
        this.toastService.show('Password has been changed. Please login with your new password.', 'Password changed', 'success', true);
      });
    } else  {
      this.toastService.show('Passwords does not match. Please try again.', 'Password mismatch', 'error', true);
    }
  }

  clearResetPassword() {
    this.currentSection = 'login';
    this.resetOTP = 0;
  }

  convertToNumber = (value: string) => { return Number(value); }

  public executeImportantAction(): void {
    this.recaptchaV3Service.execute('importantAction')
      .subscribe((token) => this.handleToken(token));
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
