import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ClientsService } from '../../../services/entities/clients.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/entities/user.service';
import { TeamsService } from '../../../services/entities/teams.service';
import { BehaviorSubject } from 'rxjs';
import { Client, Clients } from '../../../models/client';
import { StorageService } from '../../../services/app/storage/storage.service';
import { ToastService } from 'pq-ui';
import { MasterService } from '../../../services/app/base/master.service';

interface Engagment {
  wm_vertical_id: number, title: string, id: number;
}

interface EngagmentRelation {
  wm_vertical_id: number, title: string, id: number, engagement_id: number, order_number: number, service_id: number;
  status?: "new" | "remove" | "default";
}

@Component({
  selector: 'app-company-setup',
  templateUrl: './company-setup.component.html',
  styleUrls: ['./company-setup.component.scss']
})
export class CompanySetupComponent implements OnInit, OnChanges {
  
  @Output() edited: EventEmitter<boolean> = new EventEmitter(false);
  @Input() selectedClient: any;

  engagementList = {
    staff: { index: 1, label: 'Staff' },
    hourly: { index: 2, label: 'Hourly' },
    agreed: { index: 3, label: 'Agreed' }
  };

  engagements = {
    list: Object.values(this.engagementList),
    selectedEngagements: this.engagementList.staff
  };

  views1 = {
    Setup: { index: 1, label: 'Setup' },
    Settings: { index: 2, label: 'Settings' },
  };

  filterViews1 = {
    list: Object.values(this.views1),
    selectedView: this.views1.Setup,
    keys: { key: 'index', value: 'label' }
  }; 
  
  clientTypeList = [
    { index: 0, label: 'self' },
    { index: 1, label: 'client' },
    { index: 2, label: 'sub_client' },
    { index: 3, label: 'vendor' }
  ];

  clientType = {
    list: this.clientTypeList,
    selectedClientType: this.clientTypeList[1],
    keys: { key: 'index', value: 'label' }
  };

  masterCompanyList: { [key: string]: { index: number, label: string } } = {
    1: { index: 1, label: 'Carisma Solutions' },
    2: { index: 2, label: 'Purple Quay' },
    3: { index: 3, label: 'Carisma Solutions - Purple Quay' }
  };

  masterCompany = {
    list: Object.values(this.masterCompanyList),
    selectedCompanyType: this.masterCompanyList[1],
    keys: { key: 'index', value: 'label' }
  };

  dashboardTypeList = {
    0: { index: 0, label: 'Job Movement' },
    1: { index: 1, label: 'Monthly Connect' },
    2: { index: 2, label: 'Realtime' },
    3: { index: 3, label: 'Job Status' }
  };

  dashboardType: { list: any[], selectedDashboardType: any } = {
    list: [],
    selectedDashboardType: this.dashboardTypeList[1],
  };

  industryTypeList = [
    { index: 0, label: 'Technology'},
    { index: 1, label: 'Finance'},
    { index: 2, label: 'Healthcare'},
    { index: 3, label: 'Retail'},
    { index: 4, label: 'Manufacturing'},
    { index: 5, label: 'Education'},
    { index: 6, label: 'Entertainment'},
    { index: 7, label: 'Hospitality'},
    { index: 8, label: 'Real Estate'},
    { index: 9, label: 'Transportation'},
    { index: 10, label: 'Energy'},
    { index: 11, label: 'Agriculture'},
    { index: 12, label: 'Other'}
  ];

  industryType = {
    list: this.industryTypeList,
    selectedIndustryType: this.industryTypeList[1],
    keys: { key: 'index', value: 'label'}
  };

  verticals: { list: any[], selectedVertical: { wm_vertical_id: number, title: string, id: number }, keys: { key: string, value: string } } = {
    list: [],
    selectedVertical: { wm_vertical_id: 0, title: '', id: 0 },
    keys: { key: 'wm_vertical_id', value: 'title' }
  };

  filterClients: BehaviorSubject<Clients> = new BehaviorSubject(Client.defaultClients());
  filterSelectedClient: BehaviorSubject<{ works_manager_client_id: number; name: string; }> = new BehaviorSubject({ works_manager_client_id: 0, name: '' });

  selectedDashboards:string[]=[];
  selectedTestingDashboards:string[]=[];
  selectedVerticals:string[]=[];
  isFetchingClients: boolean = false;
  isFetchingClient: boolean = false;
  isUpdatingClient: boolean = false;
  currentIndex: number = 0;
  isLoading = false;
  existingCompany: any;
  companyServices: any[] = [];
  clients: any;
  searchTerm: string = '';
  doesClientExists: Boolean = false;
  isEdited: boolean = false;

  isAdmin: boolean = false;
  draggedVertical: { wm_vertical_id: number, title: string, id: number } = { wm_vertical_id: -1, title: '', id: -1 };
  engagementVertical: EngagmentRelation[] = [];
  filteredEngagementVertical: EngagmentRelation[] = [];

  primaryJobStatus: any;
  clientJobStatus: { list: any[], selectedJobStatus: any, keys: { key: string, value: string } } = {
    list: [],
    selectedJobStatus: undefined,
    keys: { key: 'Code', value: 'Name' }
  };
  mappedPrimaryJobStatus: any[] = [];
  isMappingStatus: boolean = false;

  disableDroppingVerticals: boolean = false;
  disableDroppingStatus: boolean = false;


  constructor(
    private clientsService: ClientsService,
    private activatedRoute: ActivatedRoute,
    private masterService: MasterService,
    private teamsService: TeamsService,
    private storageService: StorageService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getCompany();
  }

  setupAmbience(){
    if(this.storageService.getItem('userdata').role == 'admin') this.isAdmin = true;
    this.getDashboardMaster();
    this.getVerticals();
  }

  getDashboardMaster() {
    this.masterService.getDashbaordMaster().subscribe({
      next: (res: any) => {
        this.dashboardType.list = res.data;
      },
      error: (err) => {},
    });
  }

  getAllClients() {
    this.isFetchingClients = true;
    const body = {
      user_id: this.storageService.getItem('userdata').user_id
    };
    this.clientsService.getCPClients(body).subscribe({
      next: (res: any) => {
        this.isFetchingClients = false;
        if(res.status) {
          this.clients = res.companies.filter((company: any) => !company.name.includes('Carisma'));
          this.filterClients.value.companies = this.clients;
          
          this.selectedClient = this.clients[0];
          
          this.getCompany();
          // this.setUpDefaultClient(this.filterClients.value.companies[0].works_manager_client_id,this.filterClients.value.companies[0].name);
        }
      },
      error: (error: any) => {
        this.isFetchingClients = false;
      }
    })
  }

  searchClient() {
    if(this.searchTerm) {
      this.selectedClient = undefined;
      this.currentIndex  = -1;
      this.filterViews1.selectedView = { index: 0, label: '' };
      this.clients = this.filterClients.value.companies.filter((client: any) => client.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    } 
    else this.resetSearch();
  }

  syncCompanyDetails() {
    const body = {
      client_id: this.selectedClient.id
    };
    this.clientsService.syncBasicCompanyDetails(body).subscribe({
      next: (res: any) => {
        this.toastService.show('Company details updated', 'Updated', 'success', true);
        this.setupAmbience();
      },
      error: (error: any) => {
        this.toastService.show('Something went wrong while syncing company details from Works Manager', 'Something went wrong', 'warning', true);
      }
    });
  }

  resetSearch() {
    this.searchTerm = '';
    this.clients = this.filterClients.value.companies;
    this.selectedClient = this.filterClients.value.companies[0];
    this.getCompany();
  }

  validateCompanyDetails(): boolean {
    if(this.selectedDashboards && this.selectedDashboards.length > 0) return true;
    return false;
  }

  addCompanyDetails() {
    if(!this.validateCompanyDetails()) {
      alert('Please select dashboards and verticals');
      return;
    }
    this.isUpdatingClient = true;
    const body = {
      project_id : this.selectedClient.works_manager_client_id,
      dashboards : this.selectedDashboards.toString(),
      test_dashboards : '1',
      master_company_id : this.masterCompany.selectedCompanyType.index,
      industry_type : this.industryType.selectedIndustryType.label,
      client_type : this.clientType.selectedClientType.label,
      verticals: this.engagementVertical
    }
    // this.clientsService.addCompanyDetails(body).subscribe((res:any)=>{
    //   this.isUpdatingClient = false;
    //   this.toastService.show('Company details updated', 'Synced');
    //   this.getCompany();
    // });
  }

  updateCompanyDetails() {
    this.isUpdatingClient = true;
    if(!this.validateCompanyDetails()) {
      alert('Please select dashboards and verticals');
      this.isUpdatingClient = false;
      return;
    } else {
      const body = {
        client_id : this.selectedClient.id,
        dashboards : this.selectedDashboards.toString(),
        test_dashboards: this.selectedTestingDashboards.toString(),
        industry_type : this.industryType.selectedIndustryType.label,
        engagementVerticals: this.engagementVertical
      }
  
      this.clientsService.updateCompanyDetails(body).subscribe({
        next: (res: any) => {
          this.emitIsEdited(false);
          if(res.status) {
            this.isUpdatingClient = false;
            this.toastService.show('Company details updated', 'Synced', 'success', true);
            this.getCompany();
          } else {
            this.toastService.show(res.message, 'Something went wrong!', 'warning', true);
          }
        },
        error: (err: any) => {
          this.isUpdatingClient = false;
          this.toastService.show('Some technical error occured.', 'Something went wrong!', 'danger', true);
        }
      });
    }
  }

  handleDashboard(index: number, label: string){
    this.emitIsEdited(true);
    const position = this.selectedDashboards.findIndex(item => item == index.toString());
    if(position == -1) 
      this.selectedDashboards.push((index.toString()));
    else 
      this.selectedDashboards = this.selectedDashboards.filter(item => item != index.toString());
  }

  handleTestingDashboard(index: number, label: string){
    this.emitIsEdited(true);
    const position = this.selectedTestingDashboards.findIndex(item => item == index.toString());
    if(position == -1) 
      this.selectedTestingDashboards.push((index.toString()));
    else 
      this.selectedTestingDashboards = this.selectedTestingDashboards.filter(item => item != index.toString());
  }

  handleVerticals(event:any){
    this.verticals.selectedVertical = event;
    
    this.selectedVerticals = [];
    for (let vertical = 0; vertical < event.length; vertical++) {
     this.selectedVerticals.push((event[vertical].id));
    }
  }

  handleCompany(event:any){
    this.masterCompany.selectedCompanyType = event;
  }

  
  handleIndutryType(event:any){
    this.industryType.selectedIndustryType = event;
  }

  
  handleClientType(event:any){
    this.clientType.selectedClientType = event;
  }

  setCurrentClient(client:any, index:number){
    this.selectedClient = client;
    this.currentIndex = index;
    this.isLoading = true;
    this.getCompany();
  }

  getCompany() {
    this.isFetchingClient = true;
    const body={
      project_id: this.selectedClient.works_manager_client_id
    }
    this.clientsService.getCompanyFromDashboard(body).subscribe((res:any)=>{
      this.isFetchingClient = false;
      this.emitIsEdited(false);
      if(res.status){
        this.isLoading = false;
        this.existingCompany = res.data.company;
        this.masterCompany.selectedCompanyType.index = res.data.company.master_company_id;
        this.masterCompany.selectedCompanyType.label = this.masterCompanyList[res.data.company.master_company_id].label;
        this.companyServices = res.data.engagementVerticals;
        this.doesClientExists = res.does_company_exists;
        this.filterViews1.selectedView = this.views1.Setup;

        this.selectedDashboards = this.existingCompany.dashboards.split(',');
        this.selectedTestingDashboards = this.existingCompany.test_dashboards.split(',');
        this.engagementVertical = res.data.engagementVerticals;
        this.filterEngagementVertical(); 
        this.getJobStatus();

        // this.selectedVerticals = res.data.services.map(({ id, wm_vertical_id, title }: any) => ({ id, wm_vertical_id, title }));
      }
      else{
        this.doesClientExists = res.does_company_exists ?? false;
        this.isLoading = false;
        this.existingCompany = null;
      } 
    })
  }

  getVerticals() {
    this.teamsService.getVerticals().subscribe((res: any) => {
      if(res.status) {
        this.verticals.list = res.data.map(({ id, wm_vertical_id, title }: any) => ({ id, wm_vertical_id, title }));
        this.verticals.list = this.verticals.list.filter(vertical => vertical.wm_vertical_id !== 0);
        this.verticals.selectedVertical = this.verticals.list[0];
      } 
    });
  }

  dragVertical(event: any) {
    this.draggedVertical = {...event};
  }

  addVerticalToEngagement(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
    if(this.draggedVertical) {
      if(this.engagementVertical.findIndex(ev => ev.wm_vertical_id === this.draggedVertical.wm_vertical_id && ev.engagement_id === this.engagements.selectedEngagements.index) < 0) {
        this.engagementVertical.push({
          ...this.draggedVertical, 
          service_id: this.draggedVertical.id, 
          engagement_id: this.engagements.selectedEngagements.index, 
          order_number: 0
        });
      }
      this.emitIsEdited(true);
      this.filterEngagementVertical();
    } 
    this.resetDraggedVertical();
  }

  removeVerticalFromEngagement(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();

    this.engagementVertical = this.engagementVertical.filter(ev => !((ev.id == this.draggedVertical.id) && (ev.engagement_id == this.engagements.selectedEngagements.index)));
    this.emitIsEdited(true);
    this.filterEngagementVertical();
    this.resetDraggedVertical();
  }

  dragOver(event: DragEvent) {
    event.preventDefault();
  }

  filterEngagementVertical() {    
    // this.engagementVertical.sort((a,b) => a.wm_vertical_id - b.wm_vertical_id);
    this.filteredEngagementVertical = this.engagementVertical;
    this.filteredEngagementVertical = this.filteredEngagementVertical.filter(fev => fev.engagement_id === this.engagements.selectedEngagements.index);
  }

  resetDraggedVertical = () => this.draggedVertical = { wm_vertical_id: -1, title: '', id: -1 };

  emitIsEdited(isEdited: boolean) {
    this.isEdited = isEdited;
    this.edited.emit(this.isEdited);
  }

  toggleDroppingDisable(target: string) {
    this.disableDroppingStatus = true;
    this.disableDroppingVerticals = true;

    switch(target) {
      case 'verticals':
        this.disableDroppingVerticals = false;
        break;
      case 'status':
        this.disableDroppingStatus = false;
        break;
    }
  }

  resetDroppingDisable() {
    this.disableDroppingStatus = false;
    this.disableDroppingVerticals = false;  
  }
  
  getJobStatus() {
    this.getPrimaryJobStatus();
    this.getMappedStatusList();
    this.getSecondaryJobStatus();
  }

  getSecondaryJobStatus() {
    this.clientJobStatus.list = [];
    this.masterService.getSecondaryJobStatus().subscribe((res: any) => {
      if(res.status && res.data.length > 0) {
        this.clientJobStatus.list = res.data;
        this.clientJobStatus.selectedJobStatus = this.clientJobStatus.list[0];
      } 
    });
  }

  getPrimaryJobStatus() {
    this.masterService.getPrimaryJobStatus().subscribe((res: any) => {
      this.primaryJobStatus = res.data;
    });
  }

  // Map Primary Status to Secondary Status 
  mapPrimarytoSecondaryStatus(primaryStatus: any) {
    this.isMappingStatus = true;
    if(primaryStatus) {
      const body = {
        project_id: this.existingCompany.works_manager_client_id,
        primary_status: primaryStatus,
        secondary_status: this.clientJobStatus.selectedJobStatus.Code,
        user_id: this.storageService.getItem('userdata').user_id
      };

      this.masterService.mapPrimarytoSecondaryStatus(body).subscribe((res: any) => {
        this.isMappingStatus = false;
        this.getMappedStatusList();
      });
    }
  }

  // Getting all mapped primary job status list
  getMappedStatusList() {
    this.isMappingStatus = true;
    const body = {
      project_id: this.existingCompany.works_manager_client_id
    };
    this.masterService.getMappedStatusList(body).subscribe((res: any) => {
      this.isMappingStatus = false;
      this.mappedPrimaryJobStatus = res.data;
    });
  }

  // Remove Primary Status from Secondary Status Mapping
  removePrimaryStatusMapping(code: number) {
    this.isMappingStatus = true;
    const body = {
      code: code
    };

    this.masterService.removePrimaryStatusMapping(body).subscribe((res: any) => {
      this.isMappingStatus = false;
      this.getMappedStatusList();
    });
  }
}
