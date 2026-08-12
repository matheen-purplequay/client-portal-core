import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CATEGORIESFILTER, CRITICALITIES, JobQueries, MasterFilter, MasterFilterKeys, MasterFiltersMeta, Query, QueryTemplate } from '../../models/queries';
import { QueriesService } from 'projects/pq-admin/src/app/services/inbox/queries.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { ClientsService } from 'projects/pq-admin/src/app/services/entities/clients.service';

@Component({
  selector: 'app-query-template-selector',
  templateUrl: './query-template-selector.component.html',
  styleUrls: ['./query-template-selector.component.scss']
})
export class QueryTemplateSelectorComponent implements OnInit {

  @Output() selectedTemplate = new EventEmitter<QueryTemplate>();
  @Output() queriesPosted: EventEmitter<boolean> = new EventEmitter();
  @Output() dismissNewQuery: EventEmitter<boolean> = new EventEmitter();
  @Input() queryTemplateSelectorId: string = 'query-template-selector';
  @Input() job: JobQueries = JobQueries.defaultJobQuery();
  queryTemplates: QueryTemplate[] = [];
  newQueryTemplate: QueryTemplate = QueryTemplate.defaultQueryTemplate();
  newQuery: Query = Query.defaultQuery();

  isGettingQueryTemplates: boolean = false;
  unsavedChanges = true;
  showDismissConfirmation: boolean = false;
  showNotReadyPopup: boolean = false;
  isMounted: boolean = false;
  isSendingQueries: boolean = false;

  public Editor = ClassicEditor;  
  public newQueryEditorConfig = {
    placeholder: "Add your sub query here. Please be brief and clear.",
    toolbar: {
      items: [
        'undo', 'redo',
        '|', 'heading',
        '|', 'bold', 'italic',
        '|', 'link', 'insertTable', 'blockQuote',
        '|', 'bulletedList', 'numberedList', 'outdent', 'indent'
      ]
    },
    languageDirection: 'ltr',
  }

  @Input() categories: { list: MasterFilter[], selectedCategory: MasterFilter, keys: MasterFilterKeys } = {
    list: [],
    selectedCategory: MasterFilter.defaultMasterFilter(),
    keys: MasterFilterKeys
  }

  @Input() subCategories: { list: MasterFilter[], selectedSubCategory: MasterFilter, keys: MasterFilterKeys } = {
    list: [],
    selectedSubCategory: MasterFilter.defaultMasterFilter(),
    keys: MasterFilterKeys
  };

  criticalities = {
    list: CRITICALITIES,
    keys: MasterFilterKeys,
    selectedCriticality: CRITICALITIES[0],
    level: CRITICALITIES[0].level,
  };

  @Input() masterFilters: MasterFiltersMeta = MasterFiltersMeta.defaultMasterFiltersMeta();

  newTemplate: QueryTemplate = QueryTemplate.defaultQueryTemplate();
  queryTemplateSearchTerm: string = '';
  isSavingQueryTemplate: boolean = false;

  editingQueryTemplate: QueryTemplate = QueryTemplate.defaultQueryTemplate();

  activityList = {
    select: { index: 0, label: 'Select a emplate' },
    edit: { index: 1, label: 'Edit' },
    new: { index: 2, label: 'Create new template' },
    custom: { index: 3, label: 'Custom Query' },
  };

  activity: { list: any[], selected: { index: number, label: string } } = {
    list: Object.values(this.activityList),
    selected: this.activityList.select
  };

  clients: { list: { id: number, name: string, works_manager_client_id: number }[], selectedClient: { id: number, name: string, works_manager_client_id: number }, keys: { key: string, value: string } } = {
    list: [],
    selectedClient: { id: 0, name: '', works_manager_client_id: 0 },
    keys: { key: 'works_manager_client_id', value: 'name' }
  };

  user: any;
  // Status variables
  isEditMode: boolean = false;
  canAddCustomTemplate: boolean = false;

  alertMessage: { message: string, type: "warning" | "success" | "error", showAlert: boolean } = {
    message: '',
    type: "success",
    showAlert: false
  };

  constructor(
    private queriesService: QueriesService,
    private storageService: StorageService,
    private clientsService: ClientsService
  ) { }

  ngOnInit(): void {
    this.queryTemplates.push(QueryTemplate.defaultQueryTemplate(-1,"", "Request for confirmation", "", -1, -1, -1, "confirmation"));
    this.queryTemplates.push(QueryTemplate.defaultQueryTemplate(-1,"", "Request for clarification", "", -1, -1, -1, "clarification"));
    this.queryTemplates.push(QueryTemplate.defaultQueryTemplate(-1,"", "Request for document", "", -1, -1, -1, "document"));
    this.user = this.storageService.getItem('userdata');
    
    this.queriesService.queryFilters.subscribe((data: MasterFiltersMeta) => {
      if(data) {
        this.masterFilters = data;
        // this.newQueryTemplate.category_id = this.masterFilters.category.list[0].id;
        // this.newQueryTemplate.category_name = this.masterFilters.category.list[0].master_name;
        // this.newQueryTemplate.sub_category_id = this.masterFilters.sub_category.list[0].id;
        // this.newQueryTemplate.sub_category_name = this.masterFilters.sub_category.list[0].master_name;
        // this.newQueryTemplate.criticality_id = this.masterFilters.criticality.list[0].id;
        // this.newQueryTemplate.criticality_name = this.masterFilters.criticality.list[0].master_name;
        // this.newQueryTemplate.job_stage_id = this.masterFilters.processing_stage.list[0].id;
        // this.newQueryTemplate.job_stage_name = this.masterFilters.processing_stage.list[0].master_name;
      }
    });
    
    this.setupAmbiance();
  }

  setupAmbiance() {
    if(this.user.role == 'admin' || this.user.role == 'project_director' || this.user.role == 'group_director' || this.user.role == 'business_analyst' || this.user.role == 'team_lead') this.canAddCustomTemplate = true;
    this.getClientList();
    this.getQueryTemplates();
  }

  getQueryTemplates() {
    this.isGettingQueryTemplates = true;
    this.queryTemplates = [];
    this.queriesService.getQueryTemplates().subscribe({
      next: (res: any) => {
        this.isGettingQueryTemplates = false;
        this.queryTemplates = res.templates;
      },
      error: (err: any) => {
        this.isGettingQueryTemplates = false;
      }
    });
  }

  getQueryTemplate(id: number) {
    this.isGettingQueryTemplates = true;
    this.queryTemplates = [];
    this.queriesService.getQueryTemplate(id).subscribe({
      next: (res: any) => {
        this.isGettingQueryTemplates = false;
        this.editingQueryTemplate = res.template[0];
      },
      error: (err: any) => {
        this.isGettingQueryTemplates = false;
      }
    });
  }

  getFilters(id: number) {
    this.queriesService.getMasterFilter(id).subscribe({
      next: (res: any) => {
        if(res.status) {
          this.masterFilters.sub_category.list = res.masters.data;
          this.masterFilters.sub_category.selected.value = this.masterFilters.sub_category.list[0].id;
          this.newQueryTemplate.sub_category_id = this.masterFilters.sub_category.list[0].id;
          this.newQueryTemplate.sub_category_name = this.masterFilters.sub_category.list[0].master_name;
          this.editingQueryTemplate.sub_category_id = this.masterFilters.sub_category.list[0].id;
          this.editingQueryTemplate.sub_category_name = this.masterFilters.sub_category.list[0].master_name;
        }
      },
      error: (err: any) => {}
    });
  }

  setCategory() {

  }

  getClientList() {
    const body = {
      user_id: this.storageService.getItem('userdata').user_id
    };
    this.clientsService.getCPClients(body).subscribe({
      next: (res: any) => {
        if(res.status) {
          this.clients.list = res.companies;
          this.clients.selectedClient = this.clients.list[0];
          this.newQueryTemplate.wm_client_id = this.clients.selectedClient.id;
          console.log('clients for query template ', this.clients);
        }
      },
      error: (err: any) => {}
    });
  }

  setTemplateSelected(queryTemplate: QueryTemplate) {
    console.log('emitted query template ', queryTemplate);
    this.selectedTemplate.emit(queryTemplate);
  }

  getProcessingStage(index: number) {
    index = index - 1;
    if(index <= 0) index = 0;
    return this.queryTemplates[index].job_stage_name;
  }

  resetSearchQueryTemplatesTerm = () => { this.queryTemplateSearchTerm = ''; }

  saveQueryTemplate() {
    this.isSavingQueryTemplate = true;
    this.queriesService.saveQueryTemplate(this.newQueryTemplate).subscribe({
      next: (res: any) => {
        this.isSavingQueryTemplate = false;
        this.getQueryTemplates();
        this.activity.selected = this.activityList.select;
      },
      error: (err: any) => {
        this.isSavingQueryTemplate = false;
      }
    });
  }

  updateQueryTemplate() {
    this.isSavingQueryTemplate = true;
    this.queriesService.updateQueryTemplate(this.editingQueryTemplate).subscribe({
      next: (res: any) => {
        this.isSavingQueryTemplate = false;
        this.activity.selected = this.activityList.select;
        this.showAlertMessage(
          'Query template updated successfully.',
          "success"
        );
        this.getQueryTemplates();
      },
      error: (err: any) => {
        this.showAlertMessage(
          'Something went wrong while updating template. Please contact system administrator.',
          "warning"
        );
        this.isSavingQueryTemplate = false;
      }
    });
  }

  showAlertMessage(message: string, type: "warning" | "success" | "error", duration: number = 5000) {
    this.alertMessage.message = message;
    this.alertMessage.type = type;
    this.alertMessage.showAlert = true;
    setTimeout(() => {
      this.alertMessage.showAlert = false;
      this.alertMessage.message = '';
      this.alertMessage.type = "success";
    }, duration);
  }

  getResponseType(event: any) {
    console.log('response type ', event);
  }

  toNumber = (value: string) => parseInt(value);

  selectedClientName(id: number): string {
    if (this.clients && this.clients.list) {
      const match = this.clients.list.find(item => item.id === id);
      return match?.name || '';
    }
    return '';
  }

}
