import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/entities/user.service';
import { ToastService } from 'pq-ui';
import { RoleService } from '../../../services/entities/role.service';
import { ClientsService } from '../../../services/entities/clients.service';
import { NetworkFilterService } from '../../../services/app/network/network-filter.service';

@Component({
  selector: 'app-client-users',
  templateUrl: './client-users.component.html',
  styleUrls: ['./client-users.component.scss']
})
export class ClientUsersComponent implements OnInit {

  users: any[] = [];
  isSyncing: boolean = false;
  usersNotSynced: number = 0; 
  usersSynced: number = 0;

  activityList = {
    list: { index: 0, label: 'Client Users' },
    network: { index: 1, label: 'Network Access' }
  };

  activity = {
    list: Object.values(this.activityList),
    selected: this.activityList.list
  };

  roles: {
    list: { id: number, title: string, code: string }[],
    selectedRoles: { id: number, title: string, code: string },
    keys: { key: string, value: string }
  } = {
    list: [],
    selectedRoles: { id: 0, title: '', code: '' },
    keys: { key: 'id', value: 'title' }
  };

  whitelist_requests: { new_requests: any[], approved_requests: any[], cancelled_requests: any[] } = {
    new_requests: [],
    approved_requests: [],
    cancelled_requests: []
  };

  ipLimitRequests: { id: number, user_id: number, user_name: string, preferred_limit: number, limit: number }[] = [];

  filterIPRequestsTypeLists = {
    new: { index: 0, label: 'New Request' },
    approved: { index: 1, label: 'Approved Request' },
    cancelled: { index: 2, label: 'Cancelled Request' },
    limit: { index: 2, label: 'Limit Increase' }  
  };

  filterIPRequests = {
    list: Object.values(this.filterIPRequestsTypeLists),
    selected: this.filterIPRequestsTypeLists.new
  };

  networkLimit = [1, 2, 3, 4, 5];

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private rolesService: RoleService,
    private networkFilterService: NetworkFilterService
  ) { }

  ngOnInit(): void {
    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getClientRoles();
  }

  getClientRoles() {
    const body = {
      type: ['client'],
      category: ['management', 'employee']
    };
    this.rolesService.getRolesByType(body).subscribe({
      next: (res: any) => {
        if(res.status) {
          this.roles.list = res.data.map(({ id, title, code }: any) => ({ id, title, code }));
          this.roles.selectedRoles = this.roles.list[0];
          this.getAllClientUsers();
        }
      },
      error: (err: any) => {}
    });
  }

  getAllClientUsers() {
    const body = {
      filter_role_id: this.roles.selectedRoles.id
    };
    this.userService.getAllClientsByFilters(body).subscribe({
      next: (res: any) => {
        if(res.status) this.users = res.data;
        if(this.users.length > 0) {
          const uns = this.users.filter(user => user.wm_client_id == 0 || user.wm_client_id == null);
          this.usersNotSynced = uns.length;
          this.usersSynced = this.users.length - this.usersNotSynced;
        }
      },
      error: (err: any) => {} 
    });
  }

  syncWorksManagerID(user: any) {
    this.isSyncing = true;
    const body = {
      user_id: user.user_id
    };

    this.userService.syncWorksManagerID(body).subscribe({
      next: (res: any) => {
        this.isSyncing = false;
        if(res.status) {
          this.toastService.show('Synced works manager id', 'Client id updated', 'success', true);
          const index = this.users.findIndex((u) => u.user_id === res.updated_user.user_id);
          if (index !== -1) this.users[index] = res.updated_user;
        }
        else this.toastService.show(res.message, 'Something went wrong', 'warning', true);
      },
      error: (err: any) => {
        this.isSyncing = false;
        console.log('Something went wrong ', err);
        // this.toastService.show(err, 'Something went wrong', 'error', true);
      }
    });
  }

  handleActivity(event: any) {
    this.activity.selected = event;
    switch(this.activity.selected.index) {
      case this.activityList.list.index:
          this.getAllClientUsers();
        break;
      case this.activityList.network.index:
        this.getWhitelistedIPsRequests();
        break;
    }
  }

  getWhitelistedIPsRequests() {
    this.networkFilterService.getWhitelistedIPsRequests().subscribe({
      next: (res: any) => {
        if(res.status) {
          this.whitelist_requests.new_requests = res.data.new_requests;
          this.whitelist_requests.new_requests = res.data.new_requests.map((item: any) => ({
            ...item,
            isApproving: false,
            isApproved: false
          }));;
          this.whitelist_requests.approved_requests = res.data.approved_requests;
          this.whitelist_requests.cancelled_requests = res.data.cancelled_requests;
        }
      },
      error: (err: any) => {},
    });
  }

  replaceIP(request: any) {
    request.isApproving = true;
    const body = {
      ip_id: request.id,
      new_ip_address: request.new_ipv4_address
    };
    this.networkFilterService.replaceWhitelistIP(body).subscribe({
      next: (res: any) => {
        if(res.status) {
          request.isApproving = false;
          request.isApproved = true;
          this.toastService.show('IP address replaced', 'Replaced', 'success', true);
          this.getWhitelistedIPsRequests();
        } else {
          this.toastService.show(res.message, 'Something went wrong', 'warning', true);
        }
      },
      error: (err: any) => {
        this.toastService.show(err.error, 'Something went wrong', 'warning', true);
      }
    });
  }

  getIPLimit() {

  }

  saveIPLimit() {

  }

  toNumber = (val: string) => parseInt(val);
}
