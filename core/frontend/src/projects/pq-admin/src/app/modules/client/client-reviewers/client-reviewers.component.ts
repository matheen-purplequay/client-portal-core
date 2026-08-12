import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../services/entities/user.service';
import { TeamsService } from '../../../services/entities/teams.service';
import { QueriesService } from '../../../services/inbox/queries.service';
import { ToastService } from 'pq-ui';

interface Reviewer {
  id: number;
  wm_user_id: number;
  name: string;
  email: string;
}

class Reviewer {
  static defaultReviewer() {
    return {
      id: 0,
      wm_user_id: 0,
      name: "",
      email: ""
    };
  }
}

@Component({
  selector: 'app-client-reviewers',
  templateUrl: './client-reviewers.component.html',
  styleUrls: ['./client-reviewers.component.scss']
})
export class ClientReviewersComponent implements OnInit {

  @Input() selectedClient: any;

  internalUsers: { list: Reviewer[], selectedUser: Reviewer, selectedReviewers: Reviewer[], keys: { key: string, value: string, description: string }, isGettingUsers: boolean } = {
    list: [],
    selectedUser: Reviewer.defaultReviewer(),
    selectedReviewers: [],
    keys: { key: 'id', value: 'name', description: 'email' },
    isGettingUsers: false
  };

  selfUsers: { list: any[], selectedSelfUser: any, keys: { key: string, value: string, description: string }, isGettingUsers: boolean } = {
    list: [],
    selectedSelfUser: null,
    keys: { key: 'id', value: 'name', description: 'email' },
    isGettingUsers: false
  };
  
  reviewers: any[] = [];

  gettingReviewers: boolean = false;
  addingReviewer: boolean = false;
  removingReviewer: boolean = false;

  constructor(
    private teamsService: TeamsService,
    private queriesService: QueriesService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setupAmbiance();

    console.log('self users in reviewers component === ', this.selfUsers);
  }

  setupAmbiance() {
    this.getQueryApprovers();
    this.getTeamUsers();
    this.getSelfUsers();
  }

  getSelfUsers() {
      this.teamsService.getSelfUsers({}).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.selfUsers = res.data;
          }
        },
        error: (err: any) => {
          console.error('Something went wrong while fetching internal users');
        }
      });
  }

  getQueryApprovers() {
    this.gettingReviewers = true;
    const body = {
      client_id: this.selectedClient.works_manager_client_id
    };
    this.queriesService.getQueryApprovers(body).subscribe({
      next: (res: any) => {
        this.gettingReviewers = false;
        if(res.status) this.reviewers = res.data;
        console.log('got approvers === ', res);
      },
      error: (err: any) => {
        this.gettingReviewers = false;
      }
    });
  }

  getInternalUsers() {
    this.internalUsers.isGettingUsers = true;
    const body = {};
    this.teamsService.getSelfUsers(body).subscribe({
      next: (res: any) => {
        if(res.status) {
          this.internalUsers.list = res.data;
          this.internalUsers.selectedUser = res.data[0];
          this.internalUsers.isGettingUsers = false;
        }
      },
      error: (err: any) => {
        this.internalUsers.isGettingUsers = false;
      }
    });
  }

  getTeamUsers() {
    this.internalUsers.isGettingUsers = true;
    const body = {};
    this.teamsService.getTeamUsers(body).subscribe({
      next: (res: any) => {
        if(res.status) {
          this.internalUsers.list = res.data;
          this.internalUsers.selectedUser = res.data[0];
          this.internalUsers.isGettingUsers = false;
        }
      },
      error: (err: any) => {
        this.internalUsers.isGettingUsers = false;
      }
    });
  }

  addReviewer() {
    if(this.reviewers.findIndex(
      (user: Reviewer) => user.id === this.internalUsers.selectedUser.id) === -1
    ) {
      this.addingReviewer = true;
      const body = {
        client_id: this.selectedClient.works_manager_client_id,
        user_id: this.internalUsers.selectedUser.wm_user_id
      };
      this.queriesService.addQueryApprovers(body).subscribe({
        next: (res: any) => {
          this.addingReviewer = false;
          if(res.status) {
            this.getQueryApprovers();
            this.toastService.show('Query Reviewer has been added', 'Reviewer Added', 'success', true);
          }
        },
        error: (err :any) => {
          this.addingReviewer = false;
        }
      });
    }
  }

  removeReviewer(id: number) {
    this.removingReviewer = true;
    const body = {
      approver_id: id
    };
    this.queriesService.removeQueryApprovers(body).subscribe({
      next: (res: any) => {
        this.removingReviewer = false;
        if(res.status) {
          this.getQueryApprovers();
        }
      },
      error: (err: any) => {
        this.removingReviewer = false;
      }
    })
  }

  addToSelectedReviewer() {
    if(this.internalUsers.selectedReviewers.findIndex(
      (user: Reviewer) => user.id === this.internalUsers.selectedUser.id) === -1
    ) {
      this.internalUsers.selectedReviewers.push(this.internalUsers.selectedUser);
    }
  }

}
