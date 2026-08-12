import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { QueriesService } from '../../../../services/inbox/queries.service';
import { StorageService } from '../../../../services/app/storage/storage.service';
import { SimpleTab } from 'pq-ui';
import { DOCUMENT } from '@angular/common';
import { ClientsService } from '../../../../services/entities/clients.service';
import { Query, MAX_ATTACHMENT_LIMIT, MAX_QUERY_LIMIT, CRITICALITIES, CATEGORIES, SUBCATEGORIES, QUERYSTATUS, QUERYSTATUSFILTER, CRITICALITIESFILTER, CATEGORIESFILTER, SUBCATEGORIESFILTER, MasterFilterKeys, MasterFilter, JobQueries, QueryFilters, MasterFilterMeta, MasterFiltersMeta, QueryTemplate, DraftJobQueries } from '../models/queries';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'projects/pq-admin/src/app/services/common/common.service';


@Component({
  selector: 'app-queries-home',
  templateUrl: './queries-home.component.html',
  styleUrls: ['./queries-home.component.scss']
})
export class QueriesHomeComponent implements OnInit {
  
  searchdata : string = '';
  refreshQueries: BehaviorSubject<QueryFilters> = new BehaviorSubject<QueryFilters>(QueryFilters.defaultQueryFilters());
  maxAttachments = 3;

  jobQueries: JobQueries[] = [];
  totalQueries: number = 0;

  job: { isJobSelected: boolean, selectedJob: JobQueries } = {
    isJobSelected: false,
    selectedJob: JobQueries.defaultJobQuery()
  };
  query: any = {
    isQuerySelected: false,
    selectedQuery: {}
  };

  user: any;
  canAddCustomQuery: boolean = false;
  canAddCustomTemplate: boolean = false;

  queryViewsList = {
    card: { index: 0, label: 'Card View' },
    table: { index: 1, label: 'Table View' }
  };

  queryViews = {
    list: Object.values(this.queryViewsList),
    selectedQueryView: this.queryViewsList.card,
    keys: { key: 'index', value: 'label' }
  };

  categories: { list: MasterFilter[], selectedCategory: MasterFilter, keys: MasterFilterKeys } = {
    list: [],
    selectedCategory: MasterFilter.defaultMasterFilter(),
    keys: MasterFilterKeys
  }

  subCategories: { list: MasterFilter[], selectedSubCategory: MasterFilter, keys: MasterFilterKeys } = {
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

  filterQueryTemplatescategories = {
    list: CATEGORIESFILTER,
    selectedCategory: CATEGORIESFILTER[0],
    keys: MasterFilterKeys
  }

  filterQueryTemplatessubCategories: { list: MasterFilter[], selectedSubCategory: MasterFilter } = {
    list: [],
    selectedSubCategory: MasterFilter.defaultMasterFilter()
  };

  queryStatus = {
    list: QUERYSTATUSFILTER,
    keys: MasterFilterKeys,
    selectedStatus: QUERYSTATUSFILTER[0]
  };

  queryFilters: QueryFilters = QueryFilters.defaultQueryFilters();
  masterFilters: MasterFiltersMeta = MasterFiltersMeta.defaultMasterFiltersMeta();
  queries: Query[] = [];
  // draftQueries: DraftJobQueries[] = [];
  draftQueries: Query[] = [];
  queriesSearchTerm: string = '';

  showMessageInput: boolean = false;
  activitiesList = {
    jobs:             { index: 0, code: 'jobs', label: 'All Jobs', hiddenActivity: false },
    queries:          { index: 1, code: 'queries', label: 'Queries for the job', hiddenActivity: false },
    new_query:        { index: 2, code: 'new_query', label: 'New Query', hiddenActivity: false },
    quick_query:      { index: 3, code: 'quick_query', label: 'Quick Query', hiddenActivity: true },
    approve_queries:  { index: 4, code: 'approve_queries', label: 'Approve Queries', hiddenActivity: true },
  };

  activities = {
    list: Object.values(this.activitiesList).filter(item => item.hiddenActivity != true),
    selectedActivity: this.activitiesList.jobs,
    previousActivity: this.activitiesList.jobs
  };

  queryTemplateSearchTerm: string = '';
  initialQueryTemplate: QueryTemplate = QueryTemplate.defaultQueryTemplate();

  //progress flags
  isGettingFilters: boolean = false;
  isGettingJobs: boolean = false;
  isGettingQueries: boolean = false;
  isGettingMessage: string = '';
  hideStatistics: boolean = false;

  clients: { 
    list: {client_id: number; client: string}[],
    originalList: {client_id: number; client: string}[],
    selected: {client_id: number; client: string},
    keys: {key: string, value: string, description?: string}
  } = {
    list: [],
    originalList:[],
    selected: {client_id: 0, client: 'All client'},
    keys: { key: 'client_id', value: 'client' }
  };

  subClients: { 
    list: {sub_client_id: number; sub_client: string}[],
    originalList: {sub_client_id: number; sub_client: string}[],
    selected: {sub_client_id: number; sub_client: string},
    keys: {key: string, value: string}
  } = {
    list: [],
    originalList:[],
    selected: {sub_client_id: 0, sub_client: ''},
    keys: { key: 'sub_client_id', value: 'sub_client' }
  };

  approverJobData : any[] = [];

  constructor(
    private queriesService: QueriesService,
    private storageService: StorageService,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getItem('userdata');
    this.setupAmbiance();
  }

  setupAmbiance() {
    if(this.user.role == 'admin' || this.user.role == 'project_director' || this.user.role == 'group_director' || this.user.role == 'team_lead') {
      this.canAddCustomQuery = true;
    }
    if(this.user.role == 'admin' || this.user.role == 'project_director' || this.user.role == 'group_director' || this.user.role == 'business_analyst' || this.user.role == 'team_lead') {
      this.canAddCustomTemplate = true;
    }
    if(this.user.role == 'admin') {
      this.queryViews.selectedQueryView = this.queryViewsList.table;
    } else {
      this.queryViews.selectedQueryView = this.queryViewsList.card;
    }
    this.setupFilters();
  }

  setupFilters() {
    this.isGettingFilters = true;
    this.isGettingMessage = 'Getting all filters';
    this.queriesService.queryFilters.subscribe((data: MasterFiltersMeta) => {
      this.isGettingFilters = false;
      if(data) {
        this.categories.list = [{ id: 0, master_code: 'all', master_name: 'All' }, ...data.category.list];
        this.categories.selectedCategory = this.categories.list[0];
        this.queryFilters.category.value = this.categories.list[0].id;

        this.subCategories.list = [{ id: 0, master_code: 'all', master_name: 'All' }, ...data.sub_category.list];
        this.subCategories.selectedSubCategory = this.subCategories.list[0];
        this.queryFilters.sub_category.value = this.categories.list[0].id;

        this.criticalities.list = [{ id: 0, master_code: 'all', master_name: 'All' }, ...data.criticality.list];
        this.criticalities.selectedCriticality = this.criticalities.list[0];
        this.queryFilters.criticality.value = this.criticalities.list[0].id;

        this.queryStatus.list = [{ id: 0, master_code: 'all', master_name: 'All' }, ...data.query_status.list];
        this.queryStatus.selectedStatus = this.queryStatus.list[0];
        this.queryFilters.query_status.value = this.queryStatus.list[0].id;
        this.masterFilters = data;
        this.getJobs();
      }
    });
  }

  applyFilters() {
    if(this.activities.selectedActivity == this.activitiesList.jobs) {
      this.getJobs();
    } else if (this.activities.selectedActivity == this.activitiesList.queries) {
      this.refreshQueries.next(this.queryFilters);
      this.getQueries(this.job.selectedJob);    
    }
    console.log('refresh queries in query home', this.queryFilters);
  }

  getJobs() {
    this.isGettingJobs = true;
    this.isGettingMessage = 'Getting all jobs with queries';
    console.log('user data ', this.user);
    const user_id = this.user.staff_id ?? this.user.staff_id;
    this.queriesService.getJobsWithQueries(
      user_id, 
      this.clients.selected.client_id,
      this.queryFilters.query_status.value,
      this.queryFilters.criticality.value,
      this.queryFilters.category.value,
      this.queryFilters.sub_category.value
    ).subscribe({
      next: (res: any) => {
        this.isGettingJobs = false;
        // this.jobQueries = res.queries.slice(0, 10); // commented to show all jobs
        this.jobQueries = res.queries;

        // Get unique client list from job queries for filter
        if(this.clients.originalList.length <= 0 && this.jobQueries.length > 0) {
          this.clients.originalList = Array.from(
            new Map(this.jobQueries.map(({ client, client_id }) => [client_id, { client, client_id }])).values()
          );
          this.clients.originalList.unshift({ client_id: 0, client: 'All Clients' });

          this.clients.list = this.clients.originalList;
          this.clients.selected = this.clients.originalList[0];
          console.log('selected client == ', this.clients.originalList[0], this.clients.selected);
        } else {
          this.clients.originalList = this.clients.list;
          // this.clients.list = Array.from(
          //   new Map(this.jobQueries.map(({ client, client_id }) => [client_id, { client, client_id }])).values()
          //   );
            // this.clients.selected = this.clients.list[0];
            console.log('selected client == ', this.clients.originalList[0], this.clients.list);
        }

        // Get unique sub client list from job queries for filter
        if(this.subClients.originalList.length <= 0 && this.jobQueries.length > 0) {
          this.subClients.originalList = Array.from(
            new Map(this.jobQueries.map(({ sub_client, sub_client_id }) => [sub_client_id, { sub_client, sub_client_id }])).values()
          );
        }
        this.subClients.list = Array.from(
          new Map(this.jobQueries.map(({ sub_client, sub_client_id }) => [sub_client_id, { sub_client, sub_client_id }])).values()
        );
        this.subClients.selected = this.subClients.list[0];
      },
      error: (err: any) => {
        this.isGettingJobs = false;
      }
    });
  }

  getQueries(job: any) {
    this.isGettingQueries = true;
    this.isGettingMessage = `Getting all queries for the job ${job.job_name}`;
    this.job.selectedJob = job;
    this.queries = [];
    const body = {
      jobId: this.job.selectedJob.job_id,
      filters: Object.values(this.queryFilters),
      isAdmin: true
    };
    this.queriesService.getQueriesForJob(body).subscribe({
      next: (res: any) => {
        this.job.isJobSelected = true;
        this.switchActivity(this.activitiesList.queries);
        this.isGettingQueries = false;
        this.queries = [];
        this.queries = res.queries;
        this.selectQuery(this.queries[0]);
      },
      error: (err: any) => {
        this.isGettingQueries = false;
        this.switchActivity(this.activitiesList.jobs);
      }
    });
  }

  getDraftQueries() {
    this.draftQueries = [];
    this.queriesService.getDraftQueries(this.user.staff_id, this.clients.selected.client_id).subscribe({
      next: (res: any) => {
        // this.draftQueries = this.groupByDraftJobs(res.queries);
        this.draftQueries = res.queries;
        console.log('draft queries in queries home : ', res.queries);
        console.log('Draft Queries grouped by jobs in queries home : ', this.draftQueries);
      },
      error: (err: any) => {}
    });
  }

  groupByDraftJobs(draftQueries: any[]): DraftJobQueries[] {
    const grouped = draftQueries.reduce((acc: any, query) => {
      (acc[query.job_id] = acc[query.job_id] || []).push(query);
      return acc;
    }, {});

    const result = Object.keys(grouped).map(key => {
      const first = grouped[key][0]; // take first query in the group
      return {
        job_id: key,
        job_name: first.job_name,
        date: first.posted_date,  // or any field you want as "date"
        queries: grouped[key]
      };
    });

    console.log('converted draft queries in function : ', result);
    return result;
  }


  selectQuery(query: any) {
    this.query.isQuerySelected = true;
    this.query.selectedQuery = query;
  }

  unselectQuery() {
    this.query.isQuerySelected = false;
    this.query.selectedQuery = undefined;
  }

  raiseQueryForJob(job: JobQueries) {  
    this.job.selectedJob = job;
    this.job.isJobSelected = true;
    this.activities.selectedActivity = this.activitiesList.new_query;
  }

  raiseQueryForJobSilently(job: JobQueries) {
    this.job.selectedJob = job;
  }

  resetJob() {
    this.job.isJobSelected = false;
    this.job.selectedJob = JobQueries.defaultJobQuery();
  }

  resetQueries() {
    this.queries = [];
    this.query = Query.defaultQuery();
  }

  setCategory() {

  }

  resetSearchQueryTemplatesTerm = () => { this.queryTemplateSearchTerm = ''; }

  showNewQueryForm(queryTemplate: QueryTemplate) {
    this.initialQueryTemplate = queryTemplate;
    this.job.isJobSelected = true;
    this.activities.selectedActivity = this.activitiesList.new_query;
  }

  switchActivity(activity: any) {
    this.activities.selectedActivity = activity;
    switch(activity.code) {
      case 'jobs':
        if(this.activities.selectedActivity == this.activitiesList.queries) {
          this.unselectQuery();
          this.resetJob();
          this.resetQueries();
          this.getQueries(this.job.selectedJob);
          this.activities.selectedActivity = activity;
        } else if(this.activities.selectedActivity == this.activitiesList.new_query) {
          this.switchActivity(this.activitiesList.queries);
          this.getQueries(this.job.selectedJob);
          this.activities.selectedActivity = this.activitiesList.queries;
        } else {
          this.getJobs();
          this.activities.selectedActivity = activity;
        }
        this.job.isJobSelected = false;
        break;
      case 'queries':
        if(this.job.selectedJob.total_queries > 0) {
          this.getJobs();
          this.unselectQuery();
        } 
        else {
          this.getQueries(this.job.selectedJob);
          this.activities.selectedActivity = this.activitiesList.jobs;
        } 
        break;
      case 'new_query':
        this.activities.selectedActivity = activity;
        break;
      case 'approve_queries': 
        this.activities.selectedActivity = activity;
        this.getDraftQueries();
        break;
      default:
        break;
    }
  }

  toNumber(numStr: string): number | null {
    return isNaN(parseFloat(numStr)) ? null : parseFloat(numStr);
  }

  copyToClipboard = (val: string) => this.commonService.copyMessage(val);

  approveQueries() {
    this.getApproverJobData();
  }


  getApproverJobData() {  
    this.approverJobData = [];
    const user_id = this.user.staff_id ?? this.user.staff_id;
    this.queriesService.getApproverJobsWithQueries(
      user_id, 
      this.clients.selected.client_id,
      this.queryFilters.query_status.value,
      this.queryFilters.criticality.value,
      this.queryFilters.category.value,
      this.queryFilters.sub_category.value).subscribe((res:any)=>{
        this.approverJobData = res.queries;
    })
  }

  handleBulkApproveRefresh() {
    // Your logic to refresh data, e.g., re-fetch jobQueries or other info
    console.log("Bulk approval success event received in parent.");
    this.approveQueries(); // hypothetical method to reload parent data
    this.getDraftQueries(); // Refresh the draft queries after approval
  }

}