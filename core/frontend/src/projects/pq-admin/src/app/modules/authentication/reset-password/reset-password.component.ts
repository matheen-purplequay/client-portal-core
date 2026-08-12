import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/authentication/login.service';
import { ToastService } from 'pq-ui';
import { Router } from '@angular/router';
import { AccountService } from 'projects/reports/src/app/services/account/account.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  email: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  isSendingOTP: boolean = false;
  isOTPSent: boolean = false;
  isVerifyingOTP: boolean = false;
  isOTPVerified: boolean = false;
  isChangingPassword: boolean = false;

  constructor(
    private loginService: LoginService,
    private accountService: AccountService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  sendOTP() {
    this.isSendingOTP = true;
    this.loginService.sendOTP(this.email).subscribe((res: any) => {
      if(res && res.status) {
        this.isSendingOTP = false;
        this.isOTPSent = true;
        this.toastService.show('OTP has been sent to the given email address', 'OTP sent', 'success', true);
      } else {
        this.toastService.show('Something went wrong while sending OTP.', 'Something went wrong', 'error', true);
      }
    });
  }

  verifyOTP() {
    if(this.otp) {
      this.isVerifyingOTP = true;
      this.loginService.verifyOTP(this.email, parseInt(this.otp)).subscribe((res: any) => {
        if(res && res.status) {
          this.toastService.show('OTP verified successfully', 'OTP verified', 'success', true);
          this.isVerifyingOTP = false;
          this.isOTPVerified = true;
        } else {
          this.isVerifyingOTP = false;
          this.toastService.show('Invalid OTP. Please try again.', 'OTP verification failed', 'error', true);
        }
      });
    }
  }

  changePassword() {
    if(this.newPassword == this.confirmPassword) {
      const body =  {
        email: this.email,
        password: this.newPassword
      };
      this.accountService.changePassword(body).subscribe((res: any) => {
        if(res && res.status) {
          this.toastService.show('Please login with your new password.', 'Password changed', 'success', true);
          this.router.navigate(['login']);
        }
      });
    } else this.toastService.show('Please check your password. Both passwords must match.', 'Check password', 'warning', true);
  }

  goToPage(page: string) {
    this.router.navigateByUrl(page);
  }
}
