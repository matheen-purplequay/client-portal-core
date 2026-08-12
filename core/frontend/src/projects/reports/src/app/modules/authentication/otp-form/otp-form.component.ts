import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { LoginService } from '../../../services/authentication/login.service';
import { Router } from '@angular/router';
import { ToastService } from 'pq-ui';
import { BehaviorSubject } from 'rxjs';
import { Client, Clients } from '../../../models/client';
import { AngularDeviceInformationService } from 'angular-device-information';
import { NetworkFilterService } from '../../../services/app/network/network-filter.service';
import { CloudMessagingService } from '../../../services/app/notifications/cloud-messaging.service';

const OTP_EXPIRY_DURATION = 300;

@Component({
  selector: 'app-otp-form',
  templateUrl: './otp-form.component.html',
  styleUrls: ['./otp-form.component.scss']
})
export class OtpFormComponent implements OnInit {

  @Output() isBackToLogin: EventEmitter<boolean> = new EventEmitter();

  otp: string = '';
  @Input() email: string = '';
  isOTPVerifying: boolean = false;
  isOTPVerified: boolean = false;
  isOTPExpired: boolean = false;
  isValidOTP: boolean = false;
  otpExpiryDuration = OTP_EXPIRY_DURATION;
  currentSeconds = 0;

  isTester: boolean = false;
  isTestMode: boolean = false;
  clients: Clients = Client.defaultClients();
  userData: any;
  isFetchingClients: boolean = false;
  isSettingUpClient: boolean = false;

  deviceType: any;
  deviceInfo: any;

  user: any;

  isNewDevice: boolean = false;
  maxLimitReached: boolean = false;

  showRequestAccess: boolean = false;
  allowed_ips: any[] = [];
  isSendingIPRequest: boolean = false;
  isIPRequestSent: boolean = false;

  loginResponse: any;
  isLoggingInOneTime: boolean = false;
  allowLogin: boolean = false;

  deviceToken: string = '';

  constructor(
    private localStorageService: LocalStorageService,
    private loginService: LoginService,
    private router: Router,
    private toastService: ToastService,
    private deviceInformationService: AngularDeviceInformationService,
    private networkFilterService: NetworkFilterService,
    private cloudMessagingService: CloudMessagingService
  ) { }

  ngOnInit(): void {
    this.getAllowedIPs();
    // this.email = this.localStorageService.getItem('userdata').email;
    this.deviceInfo = this.deviceInformationService.getDeviceInfo();
    this.deviceType = this.deviceInformationService.getDeviceType();
    this.user = this.localStorageService.getItem('userdata');
    this.setTimerInterval();
    this.cloudMessagingService.getToken().subscribe((res: any) => {
      this.deviceToken = res;
    });
  }

  async setTimerInterval() {
    this.currentSeconds = this.otpExpiryDuration;
    let expiry = setInterval(() => {
      if(this.currentSeconds <= 0) clearInterval(expiry);
      else this.currentSeconds--;
    }, 1000);
  }

  verifyOTP() {
    this.isOTPVerifying = true;
    if(!this.isOTPExpired) {
      const body = {
        email: this.email,
        otp: parseInt(this.otp),
        device_info: JSON.stringify(this.deviceInfo),
        device_token: this.deviceToken,
        local_time: this.getLocalDateTime()
      };
      this.loginService.verifyOTP(body).subscribe((res: any) => {
        this.isOTPVerifying = false;
        this.loginResponse = res;
        if(res.status) {
          this.userData = res.user;
          this.isNewDevice = res.login_details.is_new_device;
          this.maxLimitReached = res.login_details.max_limit_reached;
          if(this.isNewDevice) {
            this.showRequestAccess = true;
          } else {
            if(res.isTester) {
              this.checkForTester(res.isTester);
            } 
            else {
              this.setUserDataAndLogin();
            }
          }
        } else {
          this.toastService.show('OTP mismatch. Please try again.', 'OTP not verified', 'error', true);
        }
      });

    } else {
      this.toastService.show('The One-Time Passcode (OTP) has expired. Please generate new OTP.', 'OTP Expired', 'error', true);      
    }
  }

  getLocalDateTime = () => `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}T${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;

  // setOTP(num: string) {
  //   if(this.otp.length <= 4) this.otp.push(num);
  //   if(this.otp.length == 4) {
  //     this.isValidOTP = true;
  //     (document.querySelector('#btnsubmit')! as HTMLButtonElement).focus();
  //   }
  // }

  getAllowedIPs() {
    const body = {
      user_id: 1
    };
    this.networkFilterService.getWhitelistedIPs(body).subscribe({
      next: (res: any) => {
        if(res.status) this.allowed_ips = res.data;
      },
      error: (err: any) => {},
    });
  }

  requetNewIPApproval(ip: string) {
    const name = prompt('Give a new name for the network');
    if(name) {
      this.isSendingIPRequest = true;
      const body = {
        client_id: this.userData.user_id,
        old_ip_address: ip,
        network_name: name,
      };
      this.networkFilterService.requestNewIP(body).subscribe({
        next: (res: any) => {
          this.isSendingIPRequest = false;
          if(res.status) this.isIPRequestSent = true;
          else {
            if(res.message)
              this.toastService.show(res.message, 'Unexpected issue occurred!', 'warning', true);
            else 
              this.toastService.show('Something went wrong. Please contact your system admin if problem persists.', 'Unexpected issue occurred!', 'warning', true);
          }
        },
        error: (err: any) => {
          this.isSendingIPRequest = false;
          this.toastService.show('Something went wrong while sending access request', 'Something went wrong', 'error', true);
        },
      });
    } else this.toastService.show('A name is required to send request for access.', 'Name required', 'warning', true);
  }

  resetOTP() {
    this.isValidOTP = false;
  }

  oneTimeLogin() {
    this.isLoggingInOneTime = true;
    const body = {
      user_id: this.userData.user_id
    };
    this.loginService.oneTimeLogin(body).subscribe({
      next: (res: any) => {
        this.isLoggingInOneTime = false;
        if(this.loginResponse.status) {
          if(this.loginResponse.isTester) {
            this.checkForTester(this.loginResponse.isTester);
          } 
          else {
            this.setUserDataAndLogin();
          }
        }
      },
      error: (err: any) => {
        this.isLoggingInOneTime = false;
      }
    });
  }

  checkForTester(isTester: boolean = false) {

    if(isTester) {
      this.isTester = true;
      this.allowLogin = true;
      this.isNewDevice = false;
      this.getClientsList();
    } else {
      this.setUserDataAndLogin();
    }
  }

  getClientsList() {
    this.isFetchingClients = true;
    this.clients.companies = [];
    const master_company = sessionStorage.getItem('master_company');
    let master_id = 1;
    if(master_company != null && master_company == 'pq') master_id = 2;
    const body = {
      master_id: master_id
    };
    this.loginService.getClientsByMaster(body).subscribe((res: any) => {
      this.isFetchingClients = false;
      if(res.status) this.clients.companies = res.data;
      else {
        this.toastService.show('Something went wrong. Please login again.', 'Something went wrong', 'warning', true);
        this.backToLogin();
      }
    });
  }

  setTestMode() {
    this.isTestMode = !this.isTestMode;
    this.loginService.setStagingEnv().subscribe((res: any) => {
      this.getClientsList();
    });
  }

  setClient() {
    this.isSettingUpClient = true;
    const body = {
      project_id: this.clients.selectedClient.id
    };
    this.loginService.getClient(body).subscribe((res: any) => {
      this.isSettingUpClient = false;
      if(res.status) {
        this.userData.company_id = res.data.id;
        this.userData.project_id = res.data.works_manager_client_id;
        this.userData.company_logo = res.data.company_logo;
        this.userData.company_name = res.data.name;
        // this.userData.dashboards = res.data.dashboards;
        this.userData.is_tester = true;
        if(res.partner_id) this.userData.partner_id = res.partner_id;
        else this.userData.partner_id = null;

        if(res.staff_id) this.userData.staff_id = res.staff_id;
        if(res.client_id) this.userData.client_id = res.client_id;

        if(res.master_company) {
          this.userData.master_company = res.master_company;
          if(this.userData.master_company.id == 2) sessionStorage.setItem('master_company', 'pq');
          else sessionStorage.removeItem('master_company');
        } else {
          sessionStorage.removeItem('master_company');
        }

        if(res.available_dashboards) {
          this.userData.dashboards = JSON.stringify(res.available_dashboards);
        } else {
          this.userData.dashboards = "";
        }

        if(res.available_test_dashboards) {
          this.userData.test_dashboards = JSON.stringify(res.available_test_dashboards);;
        } else {
          this.userData.test_dashboards = "";
        }
        console.log('OTP verified successfully.', res);

        this.setUserDataAndLogin();
      } else {
        this.toastService.show('Something went wrong. Please login again.', 'Something went wrong', 'warning', true);
        this.backToLogin();
      }
    });
  }

  setUserDataAndLogin() {
    this.localStorageService.setItem('userdata', JSON.stringify(this.userData));
    this.toastService.show('Welcome to Client Portal.', 'OTP verified', 'success', true);
    this.isOTPVerified = true;
    this.localStorageService.setItem('otp_verified', true);
    this.localStorageService.setItem('login_date', new Date());

    console.log('mmm: userdata from localstorage ', this.localStorageService.getItem('userdata'), this.userData);

    this.goToDashboard();
  }
  
  goToDashboard() {
    this.router.navigate(['dashboard']).then(() => {
      window.location.reload();
    });
  }

  sendOTP() {
    this.loginService.sendOTP(this.email).subscribe((res: any) => {
      this.toastService.show('New OTP sent again to your email.', 'OTP sent', 'success', true);
      this.setTimerInterval();
    });
  }

  backToLogin() {
    // this.router.navigate(['login']);
    this.isBackToLogin.emit(true);
  }

}
