import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { environment as env } from 'projects/reports/src/environments/environment';
import { filter } from 'rxjs';
import { LocalStorageService } from '../../services/app/storage/local-storage.service';
import { ChartDataService } from '../../services/dashboard/chart-data.service';
import { Location } from '@angular/common';
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
    // app.component.ts already fetches app status on every route change and
    // keeps 'portaldetails' in localStorage current — reading it here avoids
    // a second, redundant get-app-status request on every page load.
    this.appStatus = this.localStorageService.getItem('portaldetails');
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

  openPage(page: string, queryParams?: Record<string, any>) {
    this.router.navigate([page], queryParams ? { queryParams } : {});
  }

  // "Delivery Dashboard" and "Queries" both point at /dashboard/home, only
  // distinguished by ?tab=queries, so a plain currentURL.includes(pl.link)
  // would mark both active at once. A link with its own queryParams is only
  // active when the current URL actually carries that exact query string; a
  // plain link (no queryParams) is active on that path only when no such
  // query string is present, so it doesn't stay lit while a sibling tab link
  // is actually selected.
  isLinkActive(pl: { link: string; queryParams?: Record<string, any> }): boolean {
    if (!this.currentURL.includes(pl.link)) return false;
    if (pl.queryParams) {
      return Object.entries(pl.queryParams).every(([key, value]) => this.currentURL.includes(`${key}=${value}`));
    }
    return !this.currentURL.includes('?');
  }

}

