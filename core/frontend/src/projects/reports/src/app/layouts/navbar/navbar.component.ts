import { ChangeDetectorRef, Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subject, filter } from 'rxjs';
import { LocalStorageService } from '../../services/app/storage/local-storage.service';
import { CloudMessagingService } from '../../services/app/notifications/cloud-messaging.service';
import { ToastService } from 'pq-ui';
import { LoginService } from '../../services/authentication/login.service';
import { Client, Clients } from '../../models/client';
import { ClientService } from '../../services/entities/client.service';
import { config } from 'projects/reports/src/environments/config';
import { ClientUserService } from '../../shared/services/navquery/wm-client.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  config = config;
  user: { firstName: string, lastName: string, companyId: number } = { firstName: '', lastName: '', companyId: 0 };
  activity: string = '';
  submodule: string = '';
  currentURL: string = '';
  company_logo: string = '';
  company_name: string = '';
  profile_picture: string = '';
  emptyProfilePicture: string = '/assets/images/profile_placeholder.png';

  hideNavbar: boolean = false;
  isTester: boolean = false;
  master_company: any;

  currentDate = new Date();

  notifications: any[] = [];
  lastNotificationsCount: number = 0;
  allow_notification: boolean = true;

  isFetchingClients: boolean = false;
  clients: Clients = Client.defaultClients();

  clientUsers: { list: any[], selectedUser: any, keys: { key: string, value: string } } = {
    list: [],
    selectedUser: undefined,
    keys: { key: 'id', value: 'name' }
  };

  verticals: {list: any[], selectedVertical: any} = {
    list: [],
    selectedVertical: undefined
  };

  loadingText: string = '';
  hideDropdowns: boolean = false;
  
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private cd: ChangeDetectorRef,
    private cloudMessagingService: CloudMessagingService,
    private toastService: ToastService,
    private loginService: LoginService,
    private clientService: ClientService,
    private clientUserService: ClientUserService
  ) { 
    this.hideDropdowns = this.localStorageService.isItemExists('hidedropdown') ? this.localStorageService.getItem('hidedropdown') : false;
    this.activity = this.activatedRoute.snapshot.data['activity'];
    this.submodule = this.activatedRoute.snapshot.data['submodule'];
    if(!this.localStorageService.isItemExists('userdata')) this.router.navigateByUrl('/');
    this.company_logo = this.localStorageService.getItem('userdata').company_logo;
    this.company_name = this.localStorageService.getItem('userdata').company_name;
    this.profile_picture = this.localStorageService.getItem('userdata').profile_picture;

    this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((e: any) => {
      this.currentURL = e.url;
    });
    this.user.firstName = this.localStorageService.getItem('userdata').first_name || '';
    this.user.lastName = this.localStorageService.getItem('userdata').last_name || '';
    this.user.companyId = this.localStorageService.getItem('userdata').company_id;
    this.isTester = this.localStorageService.getItem('userdata').is_tester || false;   
    if(this.isTester && this.clients.companies.length <= 0) {
      this.getClientsList();
      // this.clients = this.clientService.clients;
      // this.clientUsers = this.clientService.clientUsers;
      // this.clientService.getClientUserList().subscribe({
      //   next: (res: any) => {
      //     this.clientUsers = res;
      //     console.log('selected client at start ', res, this.clientUsers);
      //   },
      //   error: (err: any) => {}
      // });

    }
    if(this.profile_picture != this.localStorageService.getItem('userdata').profile_picture) window.addEventListener('storage', this.updateProfilePicturePath);
    this.getNotifications();  
  }

  ngOnInit(): void {
    setInterval(() => {
      this.getNotifications();  
    }, 60000);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.updateProfilePicturePath);
  }

  toggleDropdownVisibility() {
    this.hideDropdowns = !this.hideDropdowns;
    this.localStorageService.setItem('hidedropdown', this.hideDropdowns);
  }

  getVerticalList() {
    const body = {
      client_id: this.clients.selectedClient.id
    };
    this.clientService.getClientVerticals(body).subscribe({
      next: (res: any) => {
        if(res.status) {
          this.verticals.list = res.data;
          this.verticals.selectedVertical = this.verticals.list[0];
          this.localStorageService.setItem('wm_vertical', this.verticals.selectedVertical);
          console.log('selected vertical at navbar ', this.verticals.selectedVertical);
        } else {
          this.toastService.show('List of verticals could not be fetched for testing', 'Something went wrong', 'warning', true);
        }
      },
      error: (err: any) => {
        console.error('Error fetching verticals', err);
      }
    });
  }

  updateProfilePicturePath = () => {
    if(this.profile_picture != this.localStorageService.getItem('userdata').profile_picture) {
      this.profile_picture = this.localStorageService.getItem('userdata').profile_picture;
      this.cd.detectChanges();
    }
  }

  openPage(page: string) {
    // this.router.navigate([page]);
    window.location.href = page;
  }

  handleImageError(event: any) {
    event.target.style.display = 'none';
  }

  getNotifications() {
    this.cloudMessagingService.getNotifications().subscribe({
      next: (res: any) => {
        if(res.status) {
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

    // this.cloudMessagingService.getNotificationStream(this.localStorageService.getItem('userdata').user_id)
    // .subscribe(
    //   (notification) => {
    //     console.log('New notification received:', notification);
    //     this.notifications.unshift(notification);
    //   },
    //   (error) => {
    //     console.error('Error receiving notifications:', error);
    //   }
    // );
  }

  deleteNotification(notification: any) {
    notification.isDeleted = true;
    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n.id !== notification.id);
      if(this.notifications.length <= 0) this.lastNotificationsCount = this.notifications.length;
    }, 400);

    console.log('notification count ', this.lastNotificationsCount, this.notifications.length);

    const body = {
      notification_id: notification.id
    };
    this.cloudMessagingService.deleteNotification(body).subscribe({
      next: (res: any) => {
      },
      error: (err: any) => {},
    });
  }

  getClientsList() {
    this.isFetchingClients = true;
    this.clients.companies = [];
    const master_company = this.localStorageService.getItem('master_company');
    console.log('master company at navbar ', master_company);
    
    let master_id = 1;
    if(master_company != null && ((master_company == 'pq') || (master_company == null ) || (master_company == 'purplequay.com.au'))) master_id = 2;
    const body = {
      master_id: master_id
    };
    this.loginService.getClientsByMaster(body).subscribe((res: any) => {
      this.isFetchingClients = false;
      if(res.status) {
        this.clients.companies = res.data;
        const localCompanyId = this.localStorageService.getItem('userdata').project_id;        
        this.clients.selectedClient = this.clients.companies.filter(company => company.works_manager_client_id === localCompanyId)[0];
        this.getClientUserList();
      } 
      else {
        this.toastService.show('List of clients could not be fetched for testing', 'Something went wrong', 'warning', true);
      }
    });
    // this.clientService.getClientUserList().subscribe({
    //   next: (res: any) => {
    //     this.clientUsers = res;
    //   },
    //   error: (err: any) => {}
    // });
  }

  setClient(company_id: number, project_id: number, company_name: string) {
    const isSameClient = (company_id == this.localStorageService.getItem('userdata').company_id);
    if(!isSameClient && confirm(`Are you sure you want to switch client to ${company_name}?`)) {
      let userdata = this.localStorageService.getItem('userdata');
      userdata.company_id = company_id;
      userdata.project_id = project_id;
      userdata.company_name = company_name;
      this.localStorageService.setItem('userdata', userdata);
      window.location.reload();
    }
  }

  getClientUserList() {    
    try {
      this.loadingText = 'Getting client user list from navbar...';
      const body = {
        client_id: this.clients.selectedClient.id
      };
      this.clientService.getClientUsers(body).subscribe({
        next: (res: any) => {
          this.loadingText = '';
          this.clientUsers.list = res.data;
          this.clientUsers.selectedUser = this.clientUsers.list[0];
          this.localStorageService.setItem('wm_user', this.clientUsers.list[0]);
          this.setClientUser(this.clientUsers.selectedUser)
          console.log('selected client at navbar ', this.clients.selectedClient.id, this.clientUsers.list, this.clientUsers.selectedUser);
        },
        error: (err: any) => {
          console.error('Error fetching client user list', err);
        }
      });
    } catch(e) {
      console.log('error while fetching the client users ', e);
    }
  }

  setClientUser(clientUser: any) {
    this.clientUsers.selectedUser = clientUser;
    this.localStorageService.setItem('wm_user', clientUser);
    this.clientUserService.emitUserChange(clientUser); 
  }
}
