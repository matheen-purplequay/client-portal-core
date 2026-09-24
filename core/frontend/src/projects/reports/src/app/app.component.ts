import { Component, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { DataService } from './services/app/data.service';
import { ActivityService } from './services/app/tracking/activity.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { AccountService } from './services/account/account.service';
import { LocalStorageService } from './services/app/storage/local-storage.service';
import { PusherService } from './services/app/notifications/pusher.service';
import { SystemService } from './services/app/system/system.service';
import { TipsPopupContent } from './shared/components/tips-popup/tips-popup.component';
import { TipsPopupService } from './shared/services/app/notifications/tips-popup.service';
import { LocationService } from './services/app/network/location.service';
import { PortalService } from './services/app/base/portal.service';
import { CloudMessagingService } from './services/app/notifications/cloud-messaging.service';

interface Message {
  message: string;
  title: string;
  user: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'reports';
  showScroll: boolean = false;
  activity: string = '';

  messages: Array<Message>;
  status: "live" | "maintenance" | "" = "live";
  isUnderMaintenance: boolean = false;
  isStatusLoaded: boolean = false;
  user: any;

  tipsPopupContent: TipsPopupContent = TipsPopupContent.defaultTipsPopupContent();
  isStaging: boolean = false;

  isOutofRegion: boolean = false;
  clientLocation: any;

  showVersionUpdate: boolean = false;
  latestUpdate: any;
  app: any;

  constructor(
    private activityService: ActivityService,
    private activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private router: Router,
    private pusherService: PusherService,
    private systemService: SystemService,
    private localStorageService: LocalStorageService,
    private tipsPopupService: TipsPopupService,
    private locationService: LocationService,
    private portalService: PortalService,
    private cloudMessagingService: CloudMessagingService
  ) {
    this.messages = [];

    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.user = this.localStorageService.getItem('userdata');
        if(this.user && this.user.role != 'admin') this.getAppStatus();
      } else  {
        this.isStatusLoaded = true;
        this.localStorageService.setItem('appstatusloaded', this.isStatusLoaded);
        this.localStorageService.setItem('undermaintenance', false);
      }
    });
  }

  ngOnInit(): void {
    // this.getRegion();
    // "Portal Updated" modal disabled from showing on load — see
    // checkForPortalLatestVersion()/getPortalLatestVersion() below.
    this.user = this.localStorageService.getItem('userdata');
    if(this.user && this.user.role != 'admin') {
      if(!this.isStatusLoaded) {
        this.isStatusLoaded = this.localStorageService.getItem('appstatusloaded') ?? false;
        this.isUnderMaintenance = this.localStorageService.getItem('undermaintenance') ?? false;
      } else  {
        this.localStorageService.setItem('appstatusloaded', this.isStatusLoaded);
        this.localStorageService.setItem('undermaintenance', false);
      }
      this.getAppStatus();
    } else {
      this.isStatusLoaded = true;
    }
    // this.checkUserLoggedIn();
    this.activity = this.activatedRoute.snapshot.data['activity'];
    
    document.addEventListener('click', this.onUserActivity.bind(this));
    document.addEventListener('keydown', this.onUserActivity.bind(this));
    document.addEventListener('mousemove', this.onUserActivity.bind(this));
    document.body.addEventListener('scroll', this.onScroll.bind(this));
    this.scrollToTop();



    if(window.location.href.includes('staging')) {
      this.isStaging = true;
    }

    console.log('window location href ', window.location.href);
    if(!window.location.href.includes('auth') && !window.location.href.includes('logout') && !window.location.href.includes('login')) { 
      if(!this.localStorageService.isItemExists('otp_verified') || this.localStorageService.getItem('otp_verified') === false) {
        window.location.href = '/login';
      }
    }
    // this.pusherService.messagesChannel.bind('client-new-message', (message: Message) => this.messages.push(message));

    // this.sendMessage('Test user', 'Test message', 'Test');

    // this.cloudMessagingService.requestPermission();
    // this.cloudMessagingService.receiveMessage();


  }

  getNetworkType(): string | null {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      return connection.effectiveType;
    }
    return null;
  }

  getRegion() {
    const body = {};
    this.locationService.getRegion(body).subscribe({
      next: (res: any) => {
        if(res.status) {
          this.isOutofRegion = res.is_out_of_region;
          this.clientLocation = res.location;
        }

        
      },
      error: (err: any) => {

      }
    });
  }

  getAppStatus() {
    this.systemService.getAppStatus().subscribe({
      next: (res: any) => {
        this.isStatusLoaded = true;
        if(res.status && res.data) {
          if(res.data.status && res.data.status == 'maintenance') this.isUnderMaintenance = true;
          else this.isUnderMaintenance = false;

          if(this.localStorageService.getItem('undermaintenance') == true && !this.isUnderMaintenance) window.location.reload();
        }
        this.localStorageService.setItem('appstatusloaded', this.isStatusLoaded);
        this.localStorageService.setItem('undermaintenance', this.isUnderMaintenance);
        this.localStorageService.setItem('portaldetails', res.data);
      },
      error: (err: any) => {
        this.isStatusLoaded = true;
        this.localStorageService.setItem('appstatusloaded', this.isStatusLoaded);
        this.localStorageService.setItem('undermaintenance', false);
      }
    });
  }

  sendMessage(user: string, text: string, msg: string) {
    const message: Message = {
       user: user,
       title: text,
       message: msg
    }
    this.pusherService.messagesChannel.trigger('client-new-message', message);
    this.messages.push(message);
  }

  checkUserLoggedIn() {
    this.accountService.checkUserLogin().subscribe((res: any) => {
      if(!res.status) this.router.navigateByUrl('/logout');
    });
  }

  onScroll() {
    this.showScroll = document.body.scrollTop > 200;
  }

  onUserActivity(event: any) {
    this.activityService.resetTimer();
  }

  scrollToTop() {
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  }

  checkForPortalLatestVersion() {
    try {
      let localVersion = `${this.localStorageService.getItem('userdata').app.local.major_version}.${this.localStorageService.getItem('userdata').app.local.minor_version}`;

      this.app = this.localStorageService.getItem('userdata').app;
      const latestVersion = this.localStorageService.getItem('userdata').app.latest_version;
      this.latestUpdate = this.localStorageService.getItem('userdata').app.latest_update;
      if(!localVersion) localVersion = '0';
      if(localVersion != latestVersion) {

        setTimeout(() => {
          this.getPortalLatestVersion();
        }, 1500);
      }
    } catch(e) {
      console.error('error while checking latest version ', e);
    }
  }

  setPortalLocalVersion() {
    const localVersion = this.localStorageService.getItem('localversion');
    const latestVersion = this.localStorageService.getItem('userdata').app.latest_version;
    this.localStorageService.setItem('localversion', latestVersion);
    const body = {
      user_id: this.localStorageService.getItem('userdata').user_id,
      major_version: latestVersion.split('.')[0],
      minor_version: latestVersion.split('.')[1]
    };
    this.portalService.updateVersionShown(body).subscribe({
      next: (res: any) => {},
      error: (err: any) => {},
    });
    if(!localVersion) {
    }
    this.showVersionUpdate = false;
  }

  getPortalLatestVersion() {
    const body = {
      id: this.localStorageService.getItem('userdata').app.latest_version_id
    };
    this.systemService.getRecentAppUpdate(body).subscribe({
      next: (res: any) => {
        this.showVersionUpdate = true;
        if(res.status)
        this.latestUpdate.title = res.data.title;
        this.latestUpdate.notes = res.data.notes;
      },
      error: (err: any) => {
        this.showVersionUpdate = false;
      }
    });
  }

  openPage(page: string) {
    this.router.navigate([page]);
  }
}
