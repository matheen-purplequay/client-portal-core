import { Component, Input, OnInit } from '@angular/core';
import { QueriesService } from '../../../services/inbox/queries.service';

@Component({
  selector: 'app-client-user-permissions',
  templateUrl: './client-user-permissions.component.html',
  styleUrls: ['./client-user-permissions.component.scss']
})
export class ClientUserPermissionsComponent implements OnInit {
  
  @Input() selectedClient: any;
  queryApprovers: any;
  isGettingQueryApprovers: boolean = false;

  constructor(
    private queriesService: QueriesService
  ) { }

  ngOnInit(): void {
    this.setupAmbiance();
    console.log('selected client ', this.selectedClient);
  }

  setupAmbiance() {
    // this.getQueryApprovers();
  }

  getQueryApprovers() {
    this.isGettingQueryApprovers = true;
    const body = {
      client_id: this.selectedClient.works_manager_client_id
    };
    this.queriesService.getQueryApprovers(body).subscribe({
      next: (res: any) => {
        this.isGettingQueryApprovers = false;
        if(res.status) {
          this.queryApprovers = res.data;
        }
        console.log('got approvers === ', res);
      },
      error: (err: any) => {
        this.isGettingQueryApprovers = false;
      }
    });
  }

  addQueryApprovers() {

  }

  removeQueryApprovers() {

  }

}
