import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsService } from '../../../services/entities/clients.service';
import { BehaviorSubject } from 'rxjs';
import { Clients, Client } from '../../../models/client';
import { StorageService } from '../../../services/app/storage/storage.service';
import { ToastService } from 'pq-ui';
import { TeamsService } from '../../../services/entities/teams.service';

@Component({
  selector: 'app-client-master',
  templateUrl: './client-master.component.html',
  styleUrls: ['./client-master.component.scss']
})
export class ClientMasterComponent implements OnInit {

  views = {
    company: { index: 1, label: 'Setup', data: 'company' },
    rules: { index: 2, label: 'Settings', data: 'rules' },
    user: { index: 3, label: 'Users', data: 'users' },
    permission: { index: 4, label: 'Permissions', data: 'user-permissions' },
    teams: { index: 5, label: 'Teams', data: 'teams' },
    reviewers: { index: 6, label: 'Reviewers', data: 'reviewers' },
    testers: { index: 7, label: 'Testers', data: 'testers' },
  };

  filterViews = {
    list: Object.values(this.views),
    selectedView: this.views.company,
    keys: { key: 'index', value: 'label' }
  }; 

  isFetchingClients: boolean = false;
  isFetchingClient: boolean = false;
  isUpdatingClient: boolean = false;
  doesClientExists: Boolean = false;
  isEdited: boolean = false;

  filterClients: BehaviorSubject<Clients> = new BehaviorSubject(Client.defaultClients());
  filterSelectedClient: BehaviorSubject<{ Pid: number; ClientName: string; }> = new BehaviorSubject({ Pid: 0, ClientName: '' });
  selectedClient: any;
  clients: any;
  wmClients: any;
  filterWMClients: any;

  searchTerm: string = '';
  currentIndex: number = 0;

  isLoading = false;
  existingCompany: any;
  companyServices: any[] = [];
  isAdmin: boolean = false;
  isSyncMode: boolean = false;
  isFetchingWMClients: boolean = false;

  selfUsers: any[] = [];

  addToCompanyList = {
    addto: { index: 0, label: 'Add To' },
    carisma: { index: 1, label: 'Carisma Solutions' },
    purplequay: { index: 2, label: 'PurpleQuay' },
    carismatopurplequay: { index: 3, label: 'Carisma to PurpleQuay' },
  }

  addToCompany = {
    list: Object.values(this.addToCompanyList),
    selected: this.addToCompanyList.addto,
    keys: { key: 'index', value: 'label' }
  };
  isSyncingClient: boolean = false;
  private searchTimeout: any;

  userData: any;

  constructor(
    private teamsService: TeamsService,
    private clientsService: ClientsService,
    private storageService: StorageService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.userData = this.storageService.getItem('userdata');
    this.setupAmbience();
  }

  setupAmbience() {
    this.getAllClients();
    if(this.storageService.getItem('userdata').role == 'admin') this.isAdmin = true;
  }

  setupSyncMode(mode: boolean) {
    this.isSyncMode = mode;
    if(this.isSyncMode) {
      this.getAllClientsFromWM();
    }
  }

  getAllClientsFromWM() {
    this.wmClients = [];
    this.filterWMClients = [];
    this.isFetchingWMClients = true;
    this.clientsService.getAllClients().subscribe({
      next: (res: any) => {
        this.isFetchingWMClients = false;
        if(res.status) {
          if(res.companies.length > 0) {
            // const wmClients = res.companies.filter(
            //   (company: any) => !this.clients.some((client: any) => company.Pid === client.works_manager_client_id)
            // );
            
            this.wmClients = res.companies;
          }
          
          this.filterWMClients = this.wmClients;
        }
      },
      error: (err: any) => {
        this.isFetchingWMClients = false;
      }
    });
  }

  //get All Clients
  getAllClients() {
    this.isFetchingClients = true;
    const body = {
      user_id: this.storageService.getItem('userdata').user_id
    };
    this.clientsService.getCPClients(body).subscribe({
      next: (res: any) => {
        this.isFetchingClients = false;
        if(res.status) {
          // this.clients = res.companies.filter((company: any) => !company.name.includes('Carisma'));
          this.clients = res.companies;
          this.filterClients.value.companies = this.clients;
          
          this.selectedClient = this.clients[0];
          this.existingCompany = this.clients[0];
          
          this.getCompany();
        }
      },
      error: (error: any) => {
        this.isFetchingClients = false;
      }
    })
  }

  getCompany() {
    this.isFetchingClient = true;
    this.existingCompany = undefined;
    const body={
      project_id: this.selectedClient.works_manager_client_id
    }
    this.clientsService.getCompanyFromDashboard(body).subscribe((res:any)=>{
      this.isFetchingClient = false;
      if(res.status){
        this.isLoading = false;
        this.existingCompany = res.data.company;
        this.selectedClient = this.existingCompany;
        this.companyServices = res.data.engagementVerticals;
        this.doesClientExists = res.does_company_exists;
      }
      else{
        this.doesClientExists = res.does_company_exists ?? false;
        this.isLoading = false;
        this.existingCompany = null;
      } 
    })
  }

  searchClient() {
    if(this.searchTerm) {
      this.selectedClient = undefined;
      this.currentIndex  = -1;
      this.clients = this.filterClients.value.companies.filter((client: any) => client.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    } 
    else this.resetSearch();
  }

  resetSearch() {
    this.searchTerm = '';
    this.clients = this.filterClients.value.companies;
    this.selectedClient = this.filterClients.value.companies[0];
    this.currentIndex = 0;
    this.isLoading = false;
    this.getCompany();
  }

  searchWMClient(searchTerm: string) {
    if(searchTerm) {
      this.filterWMClients = this.wmClients.filter((client: any) => client.ClientName.toLowerCase().includes(searchTerm.toLowerCase()));
    } 
    else this.resetSearchWMClient();
  }

  resetSearchWMClient() {
    this.filterWMClients = this.wmClients;
  }

  setCurrentClient(client:any, index:number){
    this.selectedClient = client;
    this.currentIndex = index;
    this.getCompany();
  }

  handleFilterViews(event: any) {
    this.filterViews.selectedView = event;
    // this.router.navigate(['clients', event.data]);
  }

  async copyCompanyFromWM(project_id: number, clientName: string, company_id: number, master_company_name: string) {
    if(company_id !== 0) {
      if(confirm('Are you sure you want to sync client ' + clientName + ' to ' + master_company_name + '?')) {
        this.isSyncingClient = true;
        const body = {
          project_id: project_id,
          dashboards: '1',
          test_dashboards: '1',
          master_company_id: company_id,
          industry_type: 'Finance',
          client_type: 'client',
          engagementVerticals: [
            {
              wm_vertical_id: 1, title: "Business Services", id: 1, engagement_id: 1, order_number: 0, service_id: 1
            }
          ]
        };
    
        this.clientsService.addCompanyDetails(body).subscribe({
          next: (res: any) => {
            this.isSyncingClient = false;
            this.toastService.show('Selected client synced to Client Portal database', 'Client synced', 'success', true);
            this.wmClients = this.wmClients.filter((c: any) => c.Pid !== project_id);
            this.filterWMClients = this.filterWMClients.filter((c: any) => c.Pid !== project_id);
            this.isSyncMode = false;
            this.setupAmbience();
            // this.getAllClientsFromWM();
          },
          error: (err: any) => {
            this.isSyncingClient = false;
            this.toastService.show('Could not sync selected client', 'Not synced', 'danger', true);
          }
        });
      }
    }
  }

}
