import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientsService } from '../../../services/entities/clients.service';
import { TeamsService } from '../../../services/entities/teams.service';
import { UserService } from '../../../services/entities/user.service';
import { BehaviorSubject } from 'rxjs';
import { Client, Clients } from '../../../models/client';
import { StorageService } from '../../../services/app/storage/storage.service';

interface ClientUser {
  user_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  password: string;
  company_id: number;
  role: string;
  isEditMode: boolean;
  is_active: boolean;
}

class ClientUser {
  static defaultUser() {
    return {
      user_id: 0,
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '', 
      password: '', 
      company_id: 0,
      role: '',
      isEditMode: false,
      is_active: true
    } as ClientUser;
  }
}

@Component({
  selector: 'app-client-setup',
  templateUrl: './client-setup.component.html',
  styleUrls: ['./client-setup.component.scss']
})
export class ClientSetupComponent implements OnInit, OnChanges {

  roles: {
    list: { id: number, title: string, code: string }[],
    selectedRoles: { id: number, title: string, code: string },
    keys: { key: string, value: string }
  } = {
    list: [],
    selectedRoles: { id: 0, title: '', code: '' },
    keys: { key: 'id', value: 'title' }
  };

  companyClients:{
    list: { id: number, name: string}[],
    selectedCompanyClients: {id: number, name: string},
    keys: { key: string, value: string}
  } = {
    list: [],
    selectedCompanyClients: {id: 0, name: ''},
    keys: { key: 'id', value: 'name'}
  };

  originalCompanyClients: any;

  companyClientFirstname : string = '';
  companyClientLastname : string = '';
  clientUsers: ClientUser[] = [];
  filteredClientUsers: ClientUser[] = [];
  clientUser: ClientUser = ClientUser.defaultUser();
  editedUser: ClientUser = ClientUser.defaultUser();

  isUserLoaded: boolean = false;
  doesUserExists: boolean = true;
  isFetchingUserFromWM: boolean = false;
  isCheckingUserExists: boolean = false;
  isFetchingClients: boolean = false;
  isFetchingClientsUsers: boolean = false;
  isSavingClientUser: boolean = false;
  addNewUser: boolean = false;

  clients: any;
  @Input() selectedClient: any;
  searchTerm: string = '';
  isValid: boolean = false;
  isEditMode: boolean = false;
  canDelete: boolean = false;
  canEdit: boolean = false;
  adminRole: string = '';

  filterClients: BehaviorSubject<Clients> = new BehaviorSubject(Client.defaultClients());
  filterSelectedClient: BehaviorSubject<{ Pid: number; ClientName: string; }> = new BehaviorSubject({ Pid: 0, ClientName: '' });

  constructor(
    private clientsService: ClientsService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private teamsService: TeamsService,
    private storageService: StorageService
  ) { 
  }
  
  ngOnInit(): void {
    // this.getRoles();
    // this.getClientUsers();

    this.adminRole = this.storageService.getItem('userdata').role;
    if(this.adminRole == 'admin' || this.adminRole == 'group_director') {
      this.canDelete = true;
      this.canEdit = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getRoles();
    this.getClientUsers();
  }

  // getAllClientsFromWM() {
  //   this.clientsService.getAllClientsFromWM().subscribe();
  // }

  getRoles() {
    const body = {
      type: ["client"],
      category: ["management", "employee"]
    };
    this.teamsService.getRoles(body).subscribe((res: any) => {
      if(res.status) {
        this.roles.list = res.data.map(({ id, title, code }: any) => ({ id, title, code }));
        this.roles.selectedRoles = this.roles.list[0];
        this.editedUser.role = this.roles.selectedRoles.code;
        this.clientUser.role = this.roles.selectedRoles.code;
      } 
    });
  }

  setRole(event: any) {
    this.clientUser.role = event.code;
    this.roles.selectedRoles = event;
  
  }

  setCompanyclient(event:any){
    this.companyClients.selectedCompanyClients = event;
  
  }

  searchClient() {
    if(this.searchTerm) {
      this.companyClients.list = this.originalCompanyClients.filter((client: any) => client.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    } 
    else this.resetSearch();
  }

  resetSearch() {
    this.searchTerm = '';
  }
  
  getAllCompanyFromDashboardDatabase(){
    this.clientsService.getAllClientsFromDashboardDb().subscribe((res:any)=>{
    
      this.companyClients.list = res.companies.map(({id,name  }: any) => ({ id, name }));
      this.companyClients.selectedCompanyClients = this.companyClients.list[0];    
      this.originalCompanyClients = this.companyClients.list;
      this.getClientUsers();
    })
  }

  getClientUsers() {
    this.isFetchingClientsUsers = true;
    const body = {
      company_id: this.selectedClient.id
    };

    this.userService.getClientUsers(body).subscribe((res: any) => {
      this.isFetchingClientsUsers = false;
      this.clientUsers = res.data;
      this.filteredClientUsers = this.clientUsers;
    });
  }

  searchClientUsers(searchTerm: string) {
    if(searchTerm) {
      const st = searchTerm.toLowerCase();
      this.filteredClientUsers = this.clientUsers.filter(
        user => 
          (`${user.first_name} ${user.middle_name} ${user.last_name}`.toLowerCase().includes(st)) ||
          (user.email.toLowerCase().includes(st))
      );
    } else this.filteredClientUsers = this.clientUsers;
  }

  hasBug = () => { return (!this.clientUser.first_name && !this.clientUser.email && !this.clientUser.role) };

  saveAdminAccess() {
    if(!this.hasBug()) {
      this.isSavingClientUser = true;
      const body = {
         first_name:this.clientUser.first_name,
         middle_name:this.clientUser.middle_name,
         last_name:this.clientUser.last_name,
         company_id:this.selectedClient.id,
         email:this.clientUser.email,
         role:this.clientUser.role
      }
  
      this.userService.generateAccess(body).subscribe({
        next: (res:any) => {
          this.isSavingClientUser = false;
          this.getClientUsers();
          this.resetClientUser();
        },
        error: (err: any) => {
          this.isSavingClientUser = false;
          alert('Something went wrong while saving user');
        }
      });
    }
  }

  resetClientUser() {
    this.clientUser = ClientUser.defaultUser();
    this.doesUserExists = true;
  }

  setName(name: string) {
    const username = this.splitName(name);
  
    this.clientUser.first_name = username.firstName;
    this.clientUser.middle_name = username.middleName;
    this.clientUser.last_name = username.lastName
  }

  splitName(fullName: string): { firstName: string; middleName: string; lastName: string } {
    // Handle empty string
    if (!fullName) {
      return { firstName: '', middleName: '', lastName: '' };
    }
  
    // Split words using spaces
    const nameParts = fullName.trim().split(/\s+/);
  
    // Determine middle name based on number of words
    if (nameParts.length === 1) {
      // Only first name
      return { firstName: nameParts[0], middleName: '', lastName: '' };
    } else if (nameParts.length === 2) {
      // First name and last name
      return { firstName: nameParts[0], middleName: '', lastName: nameParts[1] };
    } else if (nameParts.length === 3) {
      // First name, middle name, and last name
      return { firstName: nameParts[0], middleName: nameParts[1], lastName: nameParts[2] };
    } else {
      // More than 3 words, assume last name is the last word
      return {
        firstName: nameParts.slice(0, -1).join(' '),
        middleName: '',
        lastName: nameParts[nameParts.length - 1],
      };
    }
  }
  
  updateUser(clientUser: ClientUser) {
    if(!clientUser.first_name || !clientUser.email || !clientUser.role) {
      alert('First name, Email, and Role are required.');
      return;
    };

    this.isSavingClientUser = true;
    const body = {
      first_name:   clientUser.first_name,
      middle_name:  clientUser.middle_name,
      last_name:    clientUser.last_name,
      email:        clientUser.email,
      role:         clientUser.role,
      user_id:      clientUser.user_id,
      is_active:    (clientUser.is_active)? 1 : 0
   }

   this.userService.updateClientUser(body).subscribe({
    next: (res: any) => {
      clientUser.isEditMode = false;
      this.isSavingClientUser = false;
    },
    error: (err: any) => {
      this.isSavingClientUser = false;
    }
   });
  }

  removeUser(clientUser: ClientUser) {
    if(confirm(`Are you sure you want to delete ${clientUser.first_name} ${clientUser.last_name}`)) {
      const body = {
        client_id: clientUser.user_id
      };
      this.userService.removeClientUser(body).subscribe({
        next: (res: any) => {
          
        },
        error: (err: any) => {}
      });
    }
  }

  checkClientIfExistsWMDB() {
    this.isFetchingUserFromWM = true;
    this.isUserLoaded = false;
    this.doesUserExists = false;
    this.clientUser.first_name = '';
    this.clientUser.last_name = '';
    const body = {
      email: this.clientUser.email
    };
    this.userService.checkClientIfExists(body).subscribe((res: any) => {
      this.isUserLoaded = true;
      this.isFetchingUserFromWM = false;
      if(res.status) {
        this.doesUserExists = res.exists;
        this.setName(res.user.Contactname);
      }
    });
  }

  // checkIfUserExists() {
  //   const body = {
  //     email: this.clientUser.email 
  //   };
  //   this.isCheckingUserExists = true;
  //   this.userService.checkIfUserExists(body).subscribe((res: any) => {
  //     this.isUserLoaded = true;
  //     this.isCheckingUserExists = false;
  //     if(res.exists) {
  //       this.doesUserExists = true;
  //     } else this.doesUserExists = false;

  //   });
  // }

}
