import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { filter } from 'rxjs';
import { UserService } from '../../services/entities/user.service';
import { settings } from 'projects/pq-admin/src/environments/settings';
import { StorageService } from '../../services/app/storage/storage.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Output() sidebarCollapsed: EventEmitter<boolean> = new EventEmitter(false);

  currentURL: string = '';
  activity: string = '';
  submodule: string = '';

  primary_links = settings.sidebar_links.primary_links;
  secondary_links = settings.sidebar_links.secondary_links;
  userPermissions: any;
  isUserPermissionLoading: boolean | undefined = undefined;
  isPermissionsLoaded: boolean = false;

  isSidebarCollapsed: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private storageService: StorageService
  ) {
    this.activity = this.activatedRoute.snapshot.data['activity'];
    this.submodule = this.activatedRoute.snapshot.data['submodule'];

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentURL = e.url;
      });
  }

  ngOnInit(): void {
    if (this.storageService.isItemExists('menulinks'))
      this.primary_links = this.storageService.getItem('menulinks');
    else
      this.primary_links = settings.sidebar_links.primary_links;

    if (!this.storageService.isItemExists('permissions')) {
      const body = {
        role: this.storageService.getItem('userdata').role
      };
      if (this.isUserPermissionLoading == undefined) this.isUserPermissionLoading = true;
      this.userService.getPermissions(body).subscribe(res => {
        this.isUserPermissionLoading = false;
        this.isPermissionsLoaded = true;
        this.userPermissions = res.data;
        this.storageService.setItem('permissions', res);
        this.storageService.setItem('menulinks', settings.sidebar_links.primary_links);
        this.checkForPermissions();
      });
    } else {
      this.userPermissions = this.storageService.getItem('permissions');
      this.isPermissionsLoaded = true;
      this.checkForPermissions();
    }

    if(this.storageService.isItemExists('sidebarcollapsed')) this.isSidebarCollapsed = this.storageService.getItem('sidebarcollapsed');
    else this.storageService.setItem('sidebarcollapsed', this.isSidebarCollapsed);
  }

  checkForPermissions() {
    // this.userPermissions = this.userService.userPermissions;
    // this.primary_links = this.primary_links.filter((item: any) => {
    //   return (
    //     (item.activity.toLowerCase() == 'clients' && this.userPermissions.clients.read) ||
    //     (item.activity.toLowerCase() == 'inbox' && this.userPermissions.inbox.read) ||
    //     (item.activity.toLowerCase() == 'newsletters' && this.userPermissions.newsletters.read ) ||
    //     (item.activity.toLowerCase() == 'knowledge-center' && this.userPermissions.knowledge_center.read ) ||
    //     (item.activity.toLowerCase() == 'it' && this.userPermissions.it.read ) ||
    //     (item.activity.toLowerCase() == 'users' && this.userPermissions.users.read )
    //   )
    // });

    this.primary_links = this.primary_links.filter((item: any) => {
      try {
        if(item.type == 'divider') return true;
        const activity = item.activity.toLowerCase();
        const permissions = this.userPermissions[activity];
  
        return permissions && permissions.read;
      } catch(error) {
        return false;
      }
    });
    this.isPermissionsLoaded = true;

    console.log('Filtered primary links:', this.primary_links, this.userPermissions);
  }

  openPage(page: string, activity: string) {
    this.router.navigate([page], { state: { 'page': activity } });
  }

  hasLinkAfterDivider(index: number): boolean {
    // Check if there are remaining items in the array
    if (index < this.primary_links.length - 1) {
      // Return true if the next item is a link
      return this.primary_links[index + 1].type === 'link';
    }
    return false;
  }

  emitSidebarCollapsed = () => this.sidebarCollapsed.emit(this.isSidebarCollapsed);

  setIsSidebarCollapsed = (val: boolean) => { this.isSidebarCollapsed = val; this.emitSidebarCollapsed(); this.storageService.setItem('sidebarcollapsed', this.isSidebarCollapsed) }

}
