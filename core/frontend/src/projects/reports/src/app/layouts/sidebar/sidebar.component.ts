import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { environment as env } from 'projects/reports/src/environments/environment';
import { filter } from 'rxjs';
import { LocalStorageService } from '../../services/app/storage/local-storage.service';
import { ChartDataService } from '../../services/dashboard/chart-data.service';
import { Location } from '@angular/common';
import { SystemService } from '../../services/app/system/system.service';
import { config } from 'projects/reports/src/environments/config';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {

  config = config;
  @Input() currentPage: string = '';
  currentURL: string = '';
  activity: string = '';
  submodule: string = '';

  primary_links = env.sidebar_links.primary_links;
  secondary_links = env.sidebar_links.secondary_links;

  sidebarWidth: number = 220;

  contracts: {
    Hourly: number,
    Staff: number,
    Agreed: number
  } = {
    Hourly: 0,
    Staff: 0,
    Agreed: 0
  };

  master_company: any;
  master_company_short_name: string = 'cs';
  fallback_logo: string = '/assets/brand/cs-logo.png';

  appStatus: any;
  snowFlakesCount: number[] = Array.from({ length: 30 }, (_, i) => i + 1);
  activeLinkClass = 'active';
  animatedActiveLinkClass = 'animated-bg';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private chartDataService: ChartDataService,
    private localStorageService: LocalStorageService,
    private systemService: SystemService,
  ) { 
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.currentURL = e.url;
        if(this.currentURL == '' || this.currentURL == undefined) this.currentURL = window.location.href;
      }
    });
  }

  ngAfterViewInit(): void {
    // const sidebarWrapperElement = document.getElementById('sidebarWrapper');
    // if(sidebarWrapperElement) {
    //   this.sidebarWidth = sidebarWrapperElement?.offsetWidth - 30;
    //   if(this.sidebarWidth < 200) this.sidebarWidth = 200;
    // }
    // console.log('sb width ', sidebarWrapperElement);
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.currentURL = e.url;
        if(this.currentURL == '' || this.currentURL == undefined) this.currentURL = window.location.href;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.currentURL = e.url;
        if(this.currentURL == '' || this.currentURL == undefined) this.currentURL = window.location.href;
      }
    });
  }

  ngOnInit(): void {
    this.activity = this.activatedRoute.snapshot.data['activity'];
    this.submodule = this.activatedRoute.snapshot.data['submodule'];
    if(this.localStorageService.getItem('userdata').master_company) {
      this.master_company = this.localStorageService.getItem('userdata').master_company;
      document.documentElement.style.setProperty('--primary-color', this.master_company.primary_color);
      document.documentElement.style.setProperty('--primary-color-rgb', this.master_company.primary_color_rgb);
    }
    console.log('master company ', this.localStorageService.getItem('userdata').master_company);

    const master_company = window.location.href;
    if(master_company.includes('purplequay.com.au')) {
      this.master_company_short_name = 'pq';
    }
    this.appStatus = this.localStorageService.getItem('portaldetails');
    this.getAppStatus();
    if(config.seasonalConfig.christmas.christmasGreeting) this.activeLinkClass = `${this.activeLinkClass} ${this.animatedActiveLinkClass}`;
  }

  getContracts() {
    let getContractPayload = {
      project_id: this.localStorageService.getItem('userdata').project_id
    };
    this.chartDataService.getContracts(getContractPayload).subscribe((res: any) => {
      this.contracts = res.data[0];
      this.primary_links = this.primary_links.filter(link => {
        return link.module == 'weekly'
      });
    });
  }

  openPage(page: string) {
    this.router.navigate([page]);
  }

  async getAppStatus() {
    this.systemService.getAppStatus().subscribe({
      next: (res: any) => {
        if(res.status && res.data) {
          this.appStatus = res.data;
          this.localStorageService.setItem('portaldetails', res.data);
        }
      },
      error: (err: any) => {}
    });
  }

}

