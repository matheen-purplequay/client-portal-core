import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Client } from '@pusher/push-notifications-web';
import { BehaviorSubject } from 'rxjs';
import { Clients, Teams, TeamsPayload } from '../../../models/client';
import { ClientsService } from '../../../services/entities/clients.service';
import { TeamsService } from '../../../services/entities/teams.service';
import { UserService } from '../../../services/entities/user.service';
import { ToastService } from 'pq-ui';

interface ClientUser {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  password: string;
  company_id: number;
  role: string;
}

class ClientUser {
  static defaultUser() {
    return {
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '', 
      password: '', 
      company_id: 0,
      role: ''
    } as ClientUser;
  }
}


@Component({
  selector: 'app-client-teams',
  templateUrl: './client-teams.component.html',
  styleUrls: ['./client-teams.component.scss']
})
export class ClientTeamsComponent implements OnInit, OnChanges {

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

  views = {
    list: { index: 0, label: 'Team User List' },
    add: { index: 1, label: 'Add User To Team' }
  };

  filterViews = {
    list: Object.values(this.views),
    selectedView: this.views.list
  };

  originalCompanyClients: any;

  companyClientFirstname : string = '';
  companyClientLastname : string = '';

  isUserLoaded: boolean = false;
  doesUserExists: boolean = false;
  isFetchingUserFromWM: boolean = false;
  isCheckingUserExists: boolean = false;
  isSavingTeam: boolean = false;
  isTeamUpdating: boolean = false;
  isGettingTeams: boolean = false;
  isFetchingUsers: boolean = false;
  isAddingToTeam: boolean = false;

  clients: any;
  @Input() selectedClient: any;
  searchTerm: string = '';

  teamPayload: TeamsPayload = Teams.defaultTeamsPayload();
  teams: any;

  verticals = {
    list: [],
    selectedVertical: { wm_vertical_id: 0, title: '' },
    keys: { key: 'wm_vertical_id', value: 'title' }
  };

  selfUsers: { list: any[], selectedUser: any, keys: { key: string, value: string } } = {
    list: [],
    selectedUser: {},
    keys: { key: 'id', value: 'name' }
  };


  constructor(
    private clientsService: ClientsService,
    private teamsService: TeamsService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // this.setupAmbience();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.getVerticals();
    this.getRoles();
    this.getTeams();
  }

  getSelfUsers() {
    this.isFetchingUsers = true;
    this.selfUsers.list = [];
    const body = {
    };

    this.teamsService.getSelfUsers(body).subscribe({
      next: (res: any) => {
        this.isFetchingUsers = false;
        this.selfUsers.list = res.data;
        this.setUserToTeam(this.selfUsers.list[0]);
      },
      error: (error: any) => {
        this.isFetchingUsers = false;
      }
    });
  }

  checkIfTeamMemberExists(email: string) {
    let flag = false;
    this.teams.forEach((team: any) => {
      if(team.email == email) {
        flag = true;
        return;
      } 
    });
    return flag;
  }

  getVerticals() {
    this.teamsService.getVerticals().subscribe((res: any) => {
      if(res.status) {
        this.verticals.list = res.data.map(({ id, wm_vertical_id, title }: any) => ({ id, wm_vertical_id, title }));
        this.verticals.selectedVertical = this.verticals.list[0];
        this.teamPayload.vertical_id = this.verticals.selectedVertical.wm_vertical_id;
        this.getRoles();
      } 
    });
  }

  getRoles() {
    const body = {
      type: ["self"],
      category: ["management", "employee"]
    };
    this.teamsService.getRoles(body).subscribe((res: any) => {
      if(res.status) {
        this.roles.list = res.data.map(({ id, title, code }: any) => ({ id, title, code }));
        this.roles.selectedRoles = this.roles.list[0];
      } 
    });
  }

  setRole(event: any) {
    this.teamPayload.role_id = event.id;
    this.roles.selectedRoles = event;
  }

  getTeams() {
    this.isGettingTeams = true;
    const body = {
      client_id: this.selectedClient.works_manager_client_id
    };
    this.teamsService.getTeams(body).subscribe((res: any) => {
      this.isGettingTeams = false;
      if(res.status) this.teams = res.data;
      this.getSelfUsers();
    });
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
    this.companyClients.list = this.originalCompanyClients;
    this.companyClients.selectedCompanyClients = this.companyClients.list[0]
    this.getAllCompanyFromDashboardDatabase();
  }
  
  getAllCompanyFromDashboardDatabase() {
    this.clientsService.getAllClientsFromDashboardDb().subscribe((res:any)=>{
      this.companyClients.list = res.companies.map(({id,name  }: any) => ({ id, name }));
      this.companyClients.selectedCompanyClients = this.companyClients.list[0];    
      this.originalCompanyClients = this.companyClients.list;
    });
  }

  saveTeam() {
    this.isSavingTeam = true;
    if(!this.checkIfTeamMemberExists(this.teamPayload.email)) {
      this.teamPayload.client_id = this.selectedClient.works_manager_client_id;
      this.teamPayload.vertical_id = this.verticals.selectedVertical.wm_vertical_id;
      this.teamPayload.role_id = this.roles.selectedRoles.id;
  
      this.teamsService.addToTeam(this.teamPayload).subscribe((res: any) => {
        this.isSavingTeam = false;
        this.getTeams();
        this.teamPayload = Teams.defaultTeamsPayload();
        this.toastService.show('Team member added', 'Member added', 'success', true);
        this.filterViews.selectedView = this.views.list;
      });
    } else {
      this.toastService.show('Team member for selected vertical already exists', 'Member exists', 'warning', true);
    }
  }

  toggleTeamMemberStatus(team_id: number) {
    this.isTeamUpdating = true;
    const body = {
      team_id: team_id
    };

    this.teamsService.toggleStatusTeamMember(body).subscribe((res: any) => {
      this.isTeamUpdating = false;
      this.getTeams();
    });
  }

  deleteTeamMember(team_id: number) {
    this.isTeamUpdating = true;
    const body = {
      team_id: team_id
    };

    this.teamsService.deleteTeamMember(body).subscribe((res: any) => {
      this.isTeamUpdating = false;
      if(res.status) {
        this.toastService.show('Selected Team member has been permanently deleted', 'Team Member Deleted', 'success', true);
        this.getTeams();
      }
    });
  }

  setUserToTeam(event: any) {
    this.selfUsers.selectedUser = event;
    this.teamPayload = Teams.defaultTeamsPayload();
    this.teamPayload.email = event.email;
    this.teamPayload.name = event.name;
    this.teamPayload.wm_user_id = event.wm_user_id;
  }

  convertToNumber = (value: string) => { return Number(value); }

}
