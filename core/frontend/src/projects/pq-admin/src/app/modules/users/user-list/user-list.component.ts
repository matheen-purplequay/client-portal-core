import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../services/entities/user.service';
import { TeamsService } from '../../../services/entities/teams.service';
import { BehaviorSubject } from 'rxjs';
import { Clients, Client } from '../../../models/client';
import { ClientsService } from '../../../services/entities/clients.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'pq-ui';
import { StorageService } from '../../../services/app/storage/storage.service';
import { NetworkFilterService } from '../../../services/app/network/network-filter.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  user: { 
    first_name: string,
    last_name: string,
    email: string, 
    password: string, 
    staff_id: number,
    wm_user_id: number,
    wm_user_employee_id: number,
    company_id: number,
    role: string
  } = { 
    first_name: '',
    last_name: '',
    email: '', 
    password: '', 
    wm_user_id: 0,
    staff_id: 0,
    wm_user_employee_id: 0,
    company_id: 0,
    role: ''
  };
  users: any;
  doesUserExists: boolean = false;
  isUserLoaded: boolean = false;

  roles: {
    list: { id: number, title: string, code: string }[],
    selectedRoles: { id: number, title: string, code: string },
    keys: { key: string, value: string }
  } = {
    list: [],
    selectedRoles: { id: 0, title: '', code: '' },
    keys: { key: 'id', value: 'title' }
  };

  views = {
    users: { index: 1, label: 'Users' },
    roles: { index: 2, label: 'Roles & Permissions' },
  };

  filterViews = {
    list: Object.values(this.views),
    selectedView: this.views.users,
    keys: { key: 'index', value: 'label' }
  };

  userFilterList = {
    clients: { index: 0, label: 'Clients' },
    carisma: { index: 1, label: 'Carisma Solutions' }
  };

  userFilter = {
    list: Object.values(this.userFilterList),
    selectedFilter: this.userFilterList.clients,
    keys: { key: 'index', value: 'label' }
  };

  isFetchingUserFromWM: boolean = false;
  isFetchingRequiredDetails: boolean = false;
  isFetchingUsers: boolean = false;
  isUsersFetched: boolean = false;
  isFetchingClients: boolean = false;
  isGeneratingAccess: boolean = false;
  isCheckingUserExists: boolean = false;
  isClient: boolean = false;
  isWMSyncMode: boolean = false;
  isFetchingWMInternalUsers: boolean = false;

  company_type = 1;
  wmInternalUsers: any[] = [];
  selectedWMInternalUser: any;

  clients: BehaviorSubject<any> = new BehaviorSubject([]);

  usersFile: File | undefined;
  @ViewChild('fileInput') fileInput: ElementRef | undefined = undefined;

  selectedUser: BehaviorSubject<any> = new BehaviorSubject({});;
  userSearchTerm: string = '';
  wmUserSearchTerm: string = '';  

  constructor(
    private userService: UserService,
    private teamsService: TeamsService,
    private clientsService: ClientsService,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.getAllClients();
    this.getRoles();
    this.getUsers(1);
    this.getWMInternalUsers();
  }

  getWMInternalUsers() {
    this.isFetchingWMInternalUsers = true;
    this.userService.getWMInternalUsers().subscribe({
      next: (res: any) => {
        this.isFetchingWMInternalUsers = false;
        this.wmInternalUsers = res.data;
      },
      error: (err: any) => {
        this.isFetchingWMInternalUsers = false;
      }
    });
  }

  getAllClients() {
    const body = {
      user_id: this.storageService.getItem('userdata').user_id
    };
    this.clientsService.getCPClients(body).subscribe((res: any) => {
      if(res.status) this.clients.next(res.companies);

    });
  }

  getRoles() {
    const body = {
      type: ['self'],
      category: ['management', 'employee']
    };

    this.resetRoles();
    this.isFetchingRequiredDetails = true;
    this.teamsService.getRoles(body).subscribe((res: any) => {
      this.isFetchingRequiredDetails = false;
      if(res.status) {
        this.roles.list = res.data.map(({ id, title, code }: any) => ({ id, title, code }));
        this.roles.selectedRoles = this.roles.list[0];
        this.user.role = this.roles.selectedRoles.code;
      } 
    });
  }

  setRole(event: any) {
    this.user.role = event.code;
    this.roles.selectedRoles = event;

  }

  fetchUserFromWMDB() {
    this.isFetchingUserFromWM = true;
    this.isUserLoaded = false;
    this.doesUserExists = false;
    this.user.first_name = '';
    this.user.last_name = '';
    const body = {
      email: this.user.email
    };
    this.userService.getUserByWMEmail(body).subscribe((res: any) => {
      this.isFetchingUserFromWM = false;
      if(res.status) {
        this.user.first_name = res.data.Firstname;
        this.user.last_name = res.data.Lastname;
        this.user.staff_id = res.data.Uid;
        this.checkIfUserExists();
      }
    });
  }

  checkIfUserExists() {
    const body = {
      email: this.user.email 
    };
    this.isCheckingUserExists = true;
    this.userService.checkIfUserExists(body).subscribe((res: any) => {
      this.isUserLoaded = true;
      this.isCheckingUserExists = false;
      this.user.wm_user_employee_id = res.wm_user.NewEmworks_manager_client_id;
      if(res.exists) {
        this.doesUserExists = true;
      }
      else this.doesUserExists = false;

    });
  }

  addWMInternalUser(selectedWMInternalUser: any) {
    this.user.first_name = selectedWMInternalUser.Firstname;
    this.user.last_name = selectedWMInternalUser.Lastname;
    this.user.email = selectedWMInternalUser.NewOfficialEmailID;
    this.user.company_id = 1;
    this.user.password = 'password';
    this.user.wm_user_employee_id = selectedWMInternalUser.NewEmworks_manager_client_id;
    this.user.staff_id = selectedWMInternalUser.Uid;
    this.generateInternalAccess();
  }

  generateAccess() {
    this.isGeneratingAccess = true;
    this.userService.generateAccess(this.user).subscribe((res: any) => {

      this.isGeneratingAccess = false;
      if(res.status) {
        this.toastService.show('Access created for user', 'Access created', 'success', true);
        this.getUsers(1);
        this.resetEverything();
      } 
      else this.toastService.show('Something went wrong. Please try again.', 'Error', 'error', true);
    });
  }

  generateInternalAccess() {
    this.isGeneratingAccess = true;
    this.userService.generateInternalAccess(this.user).subscribe((res: any) => {

      this.isGeneratingAccess = false;
      if(res.status) {
        this.toastService.show('Internal User Access created', 'Access created', 'success', true);
        this.getUsers(1);
        this.resetEverything();
      } 
      else this.toastService.show('Something went wrong. Please try again.', 'Error', 'error', true);
    });
  }

  getUsers(company_type: number = -1) {
    this.isFetchingUsers = true;
    this.users = [];
    const body = {
      works_manager_client_id: 8
    };
    this.userService.getUsers(body).subscribe((res: any) => {
      this.isUsersFetched = true;
      this.isFetchingUsers = false;
      if(res.status) { 
        this.users = res.data;
        this.selectedUser.next(this.users[0]);
      }
      else this.users = [];

    }, error => {
      this.isFetchingUsers = false;
    });
  }

  setNames(name: string) {
    const names = name.split(' ');
    this.user.first_name = names.shift() || name.split(' ')[0];
    this.user.last_name = names.join(' ');
  }

  onFileSelected(event: any) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      if(target.files[0].name.split('.')[1] != 'xlsx') {
        alert('Please choose a valid excel file');
        event.preventDefault();
        this.resetFileInput();
        return;
      } else {
        this.usersFile = target.files[0];

      }
    }
  }

  resetFileInput() {
    this.fileInput!.nativeElement.value = '';
  }

  loadUsers() {
    if(this.usersFile) {
      const body = {};
      this.userService.loadUsers(body, this.usersFile, 'users').subscribe((res: any) => {

        
      });
    }
  }

  resetEverything() {
    this.user = {
      first_name: '',
      last_name: '',
      email: '', 
      password: '', 
      staff_id: 0,
      wm_user_id: 0,
      wm_user_employee_id: 0,
      company_id: 0,
      role: this.roles.selectedRoles.code
    };
    this.isUserLoaded = false;
    this.doesUserExists = false;
  }

  resetRoles() {
    this.roles.list = [];
    this.roles.selectedRoles = {id: 0, code: '', title: ''};
  }

  convertToNumber = (value: string) => Number(value);

}
