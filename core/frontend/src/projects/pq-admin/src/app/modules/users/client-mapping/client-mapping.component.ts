import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserService } from '../../../services/entities/user.service';
import { StorageService } from '../../../services/app/storage/storage.service';
import { ClientsService } from '../../../services/entities/clients.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-client-mapping',
  templateUrl: './client-mapping.component.html',
  styleUrls: ['./client-mapping.component.scss']
})
export class ClientMappingComponent implements OnInit, OnChanges {

  @Input() selectedUser: BehaviorSubject<any> = new BehaviorSubject({});
  @Input() clients: BehaviorSubject<any> = new BehaviorSubject([]);
  isClientsAvailable: boolean = false;
  filterMappedClients: any[] = [];
  mappedClients: string = '';

  fetchingMappedClients: boolean = false;

  clientSearchTerm: string = '';
  mappedClientSearchTerm: string = '';

  constructor(
    private userService: UserService,
    private clientsService: ClientsService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.clients.subscribe(c => {
      this.isClientsAvailable = true;
    });

    this.selectedUser.subscribe(user => {
      console.log('selected user == ', user);
      if(user) this.getUserWiseClient();
    })
  }

  setupAmbiance() {
    this.getUserWiseClient();
  }

  getUserWiseClient() {
    this.fetchingMappedClients = true;
    const body = {
      user_id: this.selectedUser.value.wm_user_id
    };
    this.userService.getUserWiseClient(body).subscribe((res: any) => {
      this.fetchingMappedClients = false;
      if(res.status && res.data) {
        this.mappedClients = res.data.PID;
        this.getMappedClient();
      }
    });
  }

  getMappedClient() {
    this.filterMappedClients = this.clients.value.filter((client: any) => this.mappedClients.includes(client.works_manager_client_id));
  }
}
