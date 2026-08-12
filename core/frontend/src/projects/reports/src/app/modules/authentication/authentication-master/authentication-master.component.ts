import { DOCUMENT } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Renderer } from 'html2canvas/dist/types/render/renderer';
import { ConfigService } from '../../../services/app/config.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

@Component({
  selector: 'app-authentication-master',
  templateUrl: './authentication-master.component.html',
  styleUrls: ['./authentication-master.component.scss']
})
export class AuthenticationMasterComponent implements OnInit, OnDestroy {

  user: any;
  currentYear: number = new Date().getFullYear();
  masterCompany: any;
  isMasterCompanyLoading: boolean = false;
  isMasterCompanyAvailable: boolean = false;
  email: string = '';

  carismaSupportEmail: string = "clientportalsupport@carisma-solutions.com.au";

  fallback_logo: string = '/assets/assets/images';
  csLogo: string = 'cs-logo.png';
  pqLogo: string = 'pq-logo.png';

  activities = {
    login: 'login',
    otp: 'otp',
    request: 'request'
  };
  activity = this.activities.login;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private configService: ConfigService
  ) { 
    // document.body.classList.add('bg-auth-gradient');
    const master_company = window.location.href;

    if(this.activatedRoute.snapshot.data['activity'] == 'logout') {
      
      if(this.localStorageService.isItemExists('localversion')) {
        const localVersion = this.localStorageService.getItem('localversion');
        localStorage.clear();
        this.localStorageService.setItem('localversion', localVersion);
      } else localStorage.clear();

      if(sessionStorage.getItem('master_company')) {
        this.router.navigate([''], { queryParams: { company: sessionStorage.getItem('master_company') } });
      } 
      else this.router.navigate(['']);
    } else if(this.activatedRoute.snapshot.data['activity'] == 'login') {
    }

    this.fallback_logo = `${this.fallback_logo}/${this.csLogo}`;

    if(master_company.includes('purplequay.com.au') ) {
      this.fallback_logo = `${this.fallback_logo}/${this.pqLogo}`;
      this.isMasterCompanyAvailable = true;
      this.isMasterCompanyLoading = true;
      const body = {
        short_name: 'pq'
      };
      this.configService.getMasterCompany(body).subscribe((res: any) => {
        this.isMasterCompanyLoading = false;
        if(res.status && res.data) {
          this.masterCompany = res.data;
          // document.documentElement.style.setProperty('--primary-color', res.data.primary_color);
          // document.documentElement.style.setProperty('--primary-color-rgb', 
          //   document.documentElement.style.getPropertyValue('--purplequay-color-rgb')
          // );
        } 
      });
      document.documentElement.style.setProperty('--primary-color', '#4e37bb');
      document.documentElement.style.setProperty('--primary-color-rgb', '78, 55, 187');
      console.log('purplequay color == ', document.documentElement.style.getPropertyValue('--primary-color-rgb'));
    }
  }
  
  ngOnDestroy(): void {
    
  }

  ngOnInit(): void {

  }

  isMasterCompanyLoginFormLoaded() {

  }

  setActivity(activity: string) {
    this.activity = activity;
  }

}

