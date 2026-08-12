import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Client, Teams, TeamsData, TeamsPayload } from '../../../models/client';
import { BehaviorSubject } from 'rxjs';
import { Activities, Activity } from '../../../models/activities';
import { TeamsService } from '../../../services/entities/teams.service';
import { TitleCasePipe } from '@angular/common';
import { UserService } from '../../../services/entities/user.service';
import { ToastService } from 'pq-ui';
import { StorageService } from '../../../services/app/storage/storage.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {

  @Output() dismissEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() activityChangedEvent: EventEmitter<number> = new EventEmitter();
  @Input() refresh: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() selectedClient: BehaviorSubject<{ works_manager_client_id: number; name: string; }> = new BehaviorSubject({ works_manager_client_id: 0, name: '' });

  // state variable
  activity: { list: Activities, current: number } = {
    list: Activity.defaultActivities(),
    current: Activity.defaultActivity()
  };

  // status variables
  isAgreedLoading: boolean = false;
  isAgreedSaving: boolean = false;
  isFetchingUsers: boolean = false;

  // agreed variables
  teamsPayload: TeamsPayload = Teams.defaultTeamsPayload();
  teamsData: TeamsData[] = [];
  isFetchingUserFromWM: boolean = false;
  isAddingToTeam: boolean = false;
  isTeamUpdating: boolean = false;

  // common variables
  period: { 
    years: number[],
    monthNames: string[],
    selectedPeriod: { date: number, month: number, year: number }
  } = {
    years: [2023],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selectedPeriod: { date: new Date().getDate(), month: 0, year: new Date().getFullYear() }
  };

  verticals = {
    list: [],
    selectedVertical: { wm_vertical_id: 0, title: '' },
    keys: { key: 'wm_vertical_id', value: 'title' }
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
  teamPermissions: any;

  selfUsers: { list: any[], selectedUser: any, keys: { key: string, value: string } } = {
    list: [],
    selectedUser: {},
    keys: { key: 'id', value: 'name' }
  };

  constructor(
    private teamsService: TeamsService,
    private userService: UserService,
    private titleCasePipe: TitleCasePipe,
    private toastService: ToastService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.teamPermissions = this.storageService.getItem('permissions').team;
    this.teamsPayload.vertical_id = 1;
    this.getSelfUsers();
    this.getVerticals();
    this.getRoles();
    this.getTeams();
  }

  getVerticals() {
    this.teamsService.getVerticals().subscribe((res: any) => {
      if(res.status) {
        this.verticals.list = res.data.map(({ id, wm_vertical_id, title }: any) => ({ id, wm_vertical_id, title }));
        this.verticals.selectedVertical = this.verticals.list[0];
        this.teamsPayload.vertical_id = this.verticals.selectedVertical.wm_vertical_id;
      } 
    });
  }

  getRoles() {
    const body = {
      type: ['self'],
      category: ['management', 'employee']
    };
    this.teamsService.getRoles(body).subscribe((res: any) => {
      if(res.status) {
        this.roles.list = res.data.map(({ id, title, code }: any) => ({ id, title, code }));
        this.roles.selectedRoles = this.roles.list[0];
        this.teamsPayload.role_id = this.roles.selectedRoles.id;
      } 
    });
  }

  setTitleCase(value: string) {
    if(value.includes('_')) value = value.split('_').join(' ');
    return this.titleCasePipe.transform(value);
  }

  addToTeam() {
    this.isAddingToTeam = true;
    this.teamsPayload.client_id = this.selectedClient.value.works_manager_client_id;
    this.teamsPayload.vertical_id = this.verticals.selectedVertical.wm_vertical_id;
    this.teamsPayload.role_id = this.roles.selectedRoles.id;

    this.teamsService.addToTeam(this.teamsPayload).subscribe((res: any) => {
      this.isAddingToTeam = false;
      this.getTeams();
      this.teamsPayload = Teams.defaultTeamsPayload();
    });
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

  getSelfUsers() {
    this.isFetchingUsers = true;
    this.selfUsers.list = [];
    const body = {
    };

    this.teamsService.getSelfUsers(body).subscribe({
      next: (res: any) => {
        this.isFetchingUsers = false;
        this.selfUsers.list = res.data;
        this.setUserToTeam(this.selfUsers.list[0])
        console.log('self users ', res, this.selfUsers);
      },
      error: (error: any) => {
        this.isFetchingUsers = false;
      }
    });
  }

  setUserToTeam(event: any) {
    this.selfUsers.selectedUser = event;
    this.teamsPayload = Teams.defaultTeamsPayload();
    this.teamsPayload.email = event.email;
    this.teamsPayload.name = event.name;
    this.teamsPayload.wm_user_id = event.wm_user_id;
  }

  getTeams() {
    const body = {
      client_id: this.selectedClient.value.works_manager_client_id
    };
    this.teamsService.getTeams(body).subscribe((res: any) => {
      if(res.status) this.teamsData = res.data;
    });
  }

  handleFocusChange(email: string) {
    console.log('email ', email);
    if(this.teamsPayload.email != email && email != '') {
      this.teamsPayload.email = email;
      this.fetchUserFromWMDB();
    } else {
      this.teamsPayload.email = email;
    }
  }

  fetchUserFromWMDB() {
    this.isFetchingUserFromWM = true;
    const email = this.teamsPayload.email;
    const body = {
      email: this.teamsPayload.email
    };
    this.teamsPayload = Teams.defaultTeamsPayload();
    this.teamsPayload.email = email;
    this.userService.getUserByWMEmail(body).subscribe((res: any) => {
      this.isFetchingUserFromWM = false;
      if(res.status) {
        this.teamsPayload.name = `${res.data.Firstname} ${res.data.Lastname}`;
        this.teamsPayload.wm_user_id = res.data.Uid;
      }
    });
  }

  convertToNumber = (value: string) => { return Number(value); }

}
