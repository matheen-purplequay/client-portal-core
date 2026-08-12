import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { StorageService } from '../../services/app/storage/storage.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
import { AccountService } from '../../services/account/account.service';
import { CloudMessagingService } from '../../services/app/network/cloud-messaging.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  
  user: { firstName: string, lastName: string } = { firstName: '', lastName: '' };
  role: string = '';
  activity: string = '';
  submodule: string = '';
  currentURL: string = '';
  company_logo = '';
  company_name = '';
  hideNavbar: boolean = false;
  profile_picture: string = '';
  emptyProfilePicture: string = '/assets/images/profile_placeholder.png';
  isLoadingPhoto: boolean = false;

  notifications: any[] = [];
  lastNotificationsCount: number = 0;

  interval: any;
  currentInterval = 30000; // Initial interval of 30 seconds
  maxInterval = 120000; // Maximum interval of 2 minutes
  callCount = 0;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private titlecase: TitleCasePipe,
    private cd: ChangeDetectorRef,
    private accountService: AccountService,
    private cloudMessagingService: CloudMessagingService
  ) { 
    console.log('user data in navbar', this.storageService.getItem('userdata'));
    this.activity = this.activatedRoute.snapshot.data['activity'];
    this.submodule = this.activatedRoute.snapshot.data['submodule'];
    this.company_logo = this.storageService.getItem('userdata').company_logo ?? '';
    this.company_name = this.storageService.getItem('userdata').company_name ?? '';
    this.profile_picture = this.storageService.getItem('userdata').profile_picture;


    this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((e: any) => {
      this.currentURL = e.url;
    });
  }

  ngOnInit(): void {
    this.user.firstName = this.storageService.getItem('userdata').first_name || 'Welcome';
    this.user.lastName = this.storageService.getItem('userdata').last_name || 'User';
    this.role = this.storageService.getItem('userdata').role;
    this.getProfilePicture();
    window.addEventListener('scroll', this.shouldHideNavbar.bind(this));
    window.addEventListener('storage', this.updateProfilePicturePath);

    this.interval = setInterval(() => {
      // this.getNotifications();
    }, this.currentInterval);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.updateProfilePicturePath);
    clearInterval(this.interval); 
  }

  setupAmbiance() {
    this.getProfilePicture();
  }

  getProfilePicture() {
    this.isLoadingPhoto = true;
    const body = {
      user_id: this.storageService.getItem('userdata').user_id
    };
    this.accountService.getProfilePictureByUserId(body).subscribe({
      next: (res: any) => {
        this.isLoadingPhoto = false;
        let ls_user = this.storageService.getItem('userdata');
        ls_user.profile_picture = res.data;
        this.storageService.setItem('userdata', JSON.stringify(ls_user));
        this.profile_picture = res.data;
        window.dispatchEvent(new Event('storage'));
      },
      error: (err: any) => {
        this.isLoadingPhoto = false;
      }
    })
  }

  getNotifications() {
    this.cloudMessagingService.getNotifications().subscribe({
      next: (res: any) => {
        if(res.status) {
          if (res.data && res.data.length > 0) {
            this.resetInterval();
          } else {
            this.increaseInterval();
          }
          this.notifications = [];
          this.notifications = res.data.map((notification: any) => ({
            ...notification,
            isDeleted: false
          }));
          if(this.lastNotificationsCount == 0) this.lastNotificationsCount = this.notifications.length;
          if(this.lastNotificationsCount < this.notifications.length) {
            // this.toastService.show('You have new notifications. Please click the <i class="fa-solid fa-bell"></i> to view all notifications.', 'New Notifications', 'success', true);
            this.lastNotificationsCount = this.notifications.length;
          }
        }
      },
      error: (err: any) => {},
    });
  }

  deleteNotification(notification: any) {
    notification.isDeleted = true;
    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n.id !== notification.id);
      if(this.notifications.length <= 0) this.lastNotificationsCount = this.notifications.length;
    }, 400);

    const body = {
      notification_id: notification.id
    };
    this.cloudMessagingService.deleteNotification(body).subscribe({
      next: (res: any) => {
      },
      error: (err: any) => {},
    });
  }

  openPage(page: string) {
    this.router.navigate([page]);
  }

  shouldHideNavbar() {
    // Define a scroll threshold (e.g., 100 pixels) at which you want to hide the navbar
    const scrollThreshold = 10;
  
    // Check if the window's scroll position is beyond the threshold
    this.hideNavbar = window.pageYOffset > scrollThreshold;
  }


  updateProfilePicturePath = () => {
    this.profile_picture = this.storageService.getItem('userdata').profile_picture;
    this.cd.detectChanges(); // Trigger change detection
  }


  increaseInterval() {
    this.callCount++;
    if (this.callCount % 5 === 0) {
      this.currentInterval = Math.min(this.currentInterval + 30000, this.maxInterval); // Increment by 30 seconds
      this.restartInterval();
    }
  }

  resetInterval() {
    this.currentInterval = 30000; // Reset to 30 seconds
    this.callCount = 0;
    this.restartInterval();
  }

  restartInterval() {
    clearInterval(this.interval);
    this.getNotifications();
  }
}
