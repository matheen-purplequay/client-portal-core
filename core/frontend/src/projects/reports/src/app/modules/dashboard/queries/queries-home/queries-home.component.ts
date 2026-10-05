import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CRITICALITIES, CATEGORIESFILTER, JobQueries, MasterFilter, MasterFilterKeys, MasterFiltersMeta, QueryFilters, QUERYSTATUSFILTER, QueryTemplate, Query, DownloadableJobsFieldOption, DownloadableQueriesFieldOption } from '../models/queries';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LocalStorageService } from 'projects/reports/src/app/services/app/storage/local-storage.service';
import { QueriesService } from 'projects/reports/src/app/services/dashboard/queries/queries.service';
import { ClientUserService } from 'projects/reports/src/app/shared/services/navquery/wm-client.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AssociateQueriesComponent } from '../associate-queries/associate-queries.component';


@Component({
  selector: 'app-queries-home',
  templateUrl: './queries-home.component.html',
  styleUrls: ['./queries-home.component.scss']
})
export class QueriesHomeComponent implements OnInit, OnDestroy {
  @ViewChild('associateQueries') associateQueriesComponent?: AssociateQueriesComponent;

  // Set by the parent (dashboard-home, from ?jobId=... on the Queries tab
  // route) when the user should land directly on a specific job's queries
  // instead of the jobs list — e.g. the movement widget's "View Queries" link.
  @Input() jobId: number | null = null;

  refreshQueries: BehaviorSubject<QueryFilters> = new BehaviorSubject<QueryFilters>(QueryFilters.defaultQueryFilters());
  maxAttachments = 3;

  jobQueries: JobQueries[] = [];
  originalJobQueries: JobQueries[] = [];
  totalQueries: number = 0;
  isDownloadingExcel: boolean = false;

  job: { isJobSelected: boolean, selectedJob: JobQueries } = {
    isJobSelected: false,
    selectedJob: JobQueries.defaultJobQuery()
  };
  query: any = {
    isQuerySelected: false,
    selectedQuery: {}
  };
  user: any;
  wmuser: any;

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

  showMessageInput: boolean = false;
  activitiesList = {
    jobs: { index: 0, code: 'jobs', label: 'All Jobs' },
    queries: { index: 1, code: 'queries', label: 'Queries for the job' },
    new_query: { index: 2, code: 'new_query', label: 'New Query' },
  };
  activities = {
    list: Object.values(this.activitiesList),
    selectedActivity: this.activitiesList.jobs
  };

  jobSearchTerm: string = '';
  queryTemplateSearchTerm: string = '';
  initialQueryTemplate: QueryTemplate = QueryTemplate.defaultQueryTemplate();

  //progress flags
  isGettingFilters: boolean = false;
  isGettingJobs: boolean = false;
  isGettingQueries: boolean = false;
  isGettingMessage: string = '';

  private subscription!: Subscription;
  isDownloadingQueries: boolean = false;
  jobsDownloadOptions: DownloadableJobsFieldOption[] = JobQueries.downloadableJobsFieldOptions();
  queriesDownloadOptions: DownloadableQueriesFieldOption[] = Query.downloadableQueriesFieldOptions();
  downloadableOptions = [
    { index: 'pdf', label: 'As PDF' }, { index: 'excel', label: 'As Excel' }
  ];

  constructor(
    private queriesService: QueriesService,
    private localStorageService: LocalStorageService,
    private clientUserService: ClientUserService,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscription = this.clientUserService.userChanged$.subscribe(user => {
      console.log('Received user from dropdown service:', user);
      this.wmuser = user.wm_client_id ? user : this.localStorageService.getItem('wm_user');
      this.getJobs();
    });
    this.user = this.localStorageService.getItem('userdata');
    this.wmuser = this.localStorageService.getItem('wm_user');

    console.log('userdata ', this.user);

    this.setupAmbiance();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // Clean up
  }

  setupAmbiance() {
    this.setupFilters();
  }

  setupFilters() {
    this.isGettingFilters = true;
    this.isGettingMessage = 'Getting all filters';
    this.queriesService.queryFilters.subscribe((data: MasterFiltersMeta) => {
      this.isGettingFilters = false;
      if (data) {
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
        // Filter out unwanted statuses
        this.queryStatus.list = this.queryStatus.list.filter((s: any) =>
          s.code !== 'draft' && s.code !== 'draft_rejected'
        );
        this.queryStatus.selectedStatus = this.queryStatus.list[0];
        this.queryFilters.query_status.value = this.queryStatus.list[0].id;

        console.log('user data in queries home ', this.user);
        if (this.user && this.user.role !== 'director' && this.user.role !== 'admin' && this.user.role !== 'partner') {
          this.queryFilters.raised_to = {
            code: 'raised_to',
            value: this.user.client_id
          };
        }
        this.masterFilters = data;
        this.getJobs();
      }
    });
  }

  applyFilters() {
    this.refreshQueries.next(this.queryFilters);
    console.log('refresh queries in query home', this.queryFilters);
  }

  getJobs(download: boolean = false) {
    this.jobQueries = [];
    this.isGettingJobs = true;
    this.isGettingMessage = 'Getting all jobs with queries';
    const cdata = this.localStorageService.getItem('master_company');
    if (cdata === 'pq') {
      let user_id = this.user.client_id;
      if (this.user.is_tester || this.user.role == 'tester') {
        user_id = this.wmuser.wm_client_id;
      } else {
        user_id = this.user.client_id;
      }
      const client_id = this.user.project_id;
      this.getJobsWithQueries(user_id, client_id);
    }
    else {
      let user_id = this.user.client_id;
      if (this.user.is_tester || this.user.role == 'tester') {
        user_id = this.wmuser.wm_client_id;
      } else {
        user_id = this.user.client_id;
      }
      const client_id = this.user.project_id;
      this.getJobsWithQueries(user_id, client_id);
    }
  }

  // Only auto-select the requested job once — after that, the user is free
  // to navigate back to "All Jobs" without being bounced back into it every
  // time the job list happens to reload.
  private hasAppliedRequestedJob: boolean = false;

  getJobsWithQueries(user_id: number, client_id: number) {
    this.queriesService.getJobsWithQueries(user_id, client_id).subscribe({
      next: (res: any) => {
        this.isGettingJobs = false;
        this.jobQueries = res.queries;
        this.originalJobQueries = res.queries;
        console.log('selected activity in get jobs ', this.activities.selectedActivity);

        if (this.jobId && !this.hasAppliedRequestedJob) {
          this.hasAppliedRequestedJob = true;
          const requestedJob = this.jobQueries.find(job => job.job_id === this.jobId);
          if (requestedJob) this.getQueries(requestedJob);
        }
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
      isAdmin: false
    };
    this.queriesService.getQueriesForJob(body).subscribe({
      next: (res: any) => {
        this.job.isJobSelected = true;
        this.activities.selectedActivity = this.activitiesList.queries;
        this.isGettingQueries = false;
        this.queries = this.sortQueriesByStatus(res.queries);
        this.selectQuery(this.queries[0]);
      },
      error: (err: any) => {
        this.isGettingQueries = false;
        this.switchActivity(this.activitiesList.jobs);
      }
    });
  }
  
  // Open queries (status id 2) need attention first, everything else keeps its original order
  sortQueriesByStatus(queries: Query[]): Query[] {
    const OPEN_STATUS_ID = 2;
    return [...queries].sort((a, b) => {
      const aIsOpen = a.query_status_id === OPEN_STATUS_ID;
      const bIsOpen = b.query_status_id === OPEN_STATUS_ID;
      return aIsOpen === bIsOpen ? 0 : aIsOpen ? -1 : 1;
    });
  }

  triggerDownloadTable() {
    if (this.activities.selectedActivity.code === this.activitiesList.jobs.code) {
      this.downloadJobsAsExcel();
    } else if (this.activities.selectedActivity.code === this.activitiesList.queries.code) {
      this.downloadQueriesAsExcel();
    }
  }

  downloadJobsAsExcel() {
    this.isDownloadingExcel = true;
    let client_id = this.user.project_id;
    let user_id = this.user.client_id;

    const cdata = this.localStorageService.getItem('master_company');
    if (cdata === 'pq') {
      if (this.user.is_tester || this.user.role == 'tester') {
        user_id = this.wmuser.wm_client_id;
      } else {
        user_id = this.user.client_id;
      }
      client_id = this.user.project_id;
    }
    else {
      user_id = this.user.client_id;
      if (this.user.is_tester || this.user.role == 'tester') {
        user_id = this.wmuser.wm_client_id;
      } else {
        user_id = this.user.client_id;
      }
      client_id = this.user.project_id;
    }

    this.queriesService.downloadJobsAsExcel(user_id, client_id).subscribe({
      next: (res: any) => {
        this.dowloadExcel(res);
        this.isDownloadingExcel = false;
      },
      error: (err: any) => {
        this.isDownloadingExcel = false;
      }
    });
  }

  downloadQueriesAsExcel() {
    this.isDownloadingExcel = true;
    const body = {
      jobId: this.job.selectedJob.job_id,
      filters: Object.values(this.queryFilters),
      isAdmin: false
    };
    this.queriesService.downloadQueriesAsExcel(body).subscribe({
      next: (res: any) => {
        this.dowloadExcel(res);
        this.isDownloadingExcel = false;
      },
      error: (err: any) => {
        this.isDownloadingExcel = false;
      }
    });
  }

  dowloadExcel(data: any) {
    var downloadURL = window.URL.createObjectURL(data);
    var link = document.createElement('a');
    link.href = downloadURL;
    link.download = "Exported_data.xlsx";
    link.click();
    this.isDownloadingExcel = false;
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

  searchJobs(searchTerm: string) {
    if (searchTerm && searchTerm.length > 0) {
      this.jobQueries = this.jobQueries.filter(job => job.job_name.toLowerCase().includes(searchTerm.toLowerCase()));
    } else {
      this.jobQueries = [...this.originalJobQueries];
    }
  }

  resetSearchQueryTemplatesTerm = () => { this.queryTemplateSearchTerm = ''; }

  showNewQueryForm(queryTemplate: QueryTemplate) {
    this.initialQueryTemplate = queryTemplate;
    this.job.isJobSelected = true;
    this.activities.selectedActivity = this.activitiesList.new_query;
  }

  switchActivity(activity: any) {
    console.log('switch activity ', activity, this.activities, this.job);
    this.activities.selectedActivity = activity;
    switch (activity.code) {
      case 'jobs':
        if (this.activities.selectedActivity == this.activitiesList.queries) {
          this.unselectQuery();
          this.resetJob();
          this.resetQueries();
          this.getQueries(this.job.selectedJob);
          this.activities.selectedActivity = activity;
        } else if (this.activities.selectedActivity == this.activitiesList.new_query) {
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
        if (this.job.selectedJob.total_queries > 0) {
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
      default:
        break;
    }
    console.log('selected activity in queries home - ', this.activities.selectedActivity);
  }


  // Waits until every query's replies have been fetched (no "Getting all replies..." loader left),
  // instead of guessing with a fixed delay. Gives up after timeoutMs so export never hangs.
  private async waitForRepliesToLoad(containerId: string, timeoutMs = 60000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const container = document.getElementById(containerId);
      if (container) {
        const expected = container.querySelectorAll(':scope > .row').length;
        const rendered = container.querySelectorAll('app-card-query-replies').length;
        const loading = container.querySelectorAll('app-simple-time-loading').length;
        if (rendered >= expected && loading === 0) break;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    // let the last replies paint before capturing
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async generatePDF(containerId: string) {
    // Expand every query's description/documents section (normally only the
    // selected one is rendered) so the PDF captures all of them, not just one.
    if (this.associateQueriesComponent) {
      this.associateQueriesComponent.isGeneratingPdf = true;
      this.cdr.detectChanges();
      await this.waitForRepliesToLoad(containerId);
    }

    const content = document.getElementById(containerId);
    if (!content) {
      if (this.associateQueriesComponent) this.associateQueriesComponent.isGeneratingPdf = false;
      this.isDownloadingExcel = false;
      return;
    }

    // Step 1: Create wrapper
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    // wrapper.style.zIndex = '-1'; // Behind everything

    // Step 2: Create header
    const header = document.createElement('div');
    header.innerHTML = `
    <div style="text-align: center; margin: 20px 0;">
      <h2>${this.job.selectedJob.job_name}</h2>
      <p>JY: ${this.job.selectedJob.jy} | FY: ${this.job.selectedJob.fy}</p>
    </div>
  `;

    // Step 3: Move content into wrapper
    const parent = content.parentElement!;
    const nextSibling = content.nextSibling;
    wrapper.appendChild(header);
    wrapper.appendChild(content);

    document.body.appendChild(wrapper); // Add wrapper to DOM for rendering

    // Step 4: Hide unwanted elements inside content (keep reply history visible, just hide interactive controls)
    const elementsToHide = wrapper.querySelectorAll('pq-button, .query-reply-controls');
    elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');

    // Step 5: Render wrapper to canvas
    // Measure each query block (bottom edge, in CSS px, relative to the wrapper) so pages
    // can be broken between queries instead of through the middle of one.
    const wrapperTop = wrapper.getBoundingClientRect().top;
    const blockBottoms = Array.from(content.querySelectorAll(':scope > .row'))
      .map(el => el.getBoundingClientRect().bottom - wrapperTop);

    html2canvas(wrapper).then(canvas => {
      const imgWidth = 208;
      const pageHeight = 295;
      const scale = canvas.width / wrapper.offsetWidth;          // canvas px per CSS px
      const pageHeightPx = (pageHeight * canvas.width / imgWidth) / scale; // page height in CSS px
      const totalHeightPx = canvas.height / scale;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let pageStart = 0;
      let firstPage = true;

      while (pageStart < totalHeightPx - 1) {
        const limit = pageStart + pageHeightPx;
        let pageEnd = totalHeightPx <= limit ? totalHeightPx : limit;
        if (totalHeightPx > limit) {
          // break after the last query that fully fits; if a single query is taller than a page, hard cut
          const fitting = blockBottoms.filter(b => b > pageStart + 1 && b <= limit);
          if (fitting.length > 0) pageEnd = fitting[fitting.length - 1];
        }

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.max(1, Math.round((pageEnd - pageStart) * scale));
        sliceCanvas.getContext('2d')!.drawImage(
          canvas,
          0, Math.round(pageStart * scale), canvas.width, sliceCanvas.height,
          0, 0, canvas.width, sliceCanvas.height
        );

        if (!firstPage) pdf.addPage();
        firstPage = false;
        pdf.addImage(
          sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0,
          imgWidth, sliceCanvas.height * imgWidth / sliceCanvas.width
        );
        pageStart = pageEnd;
      }

      pdf.save(`${this.job.selectedJob.job_name} - queries.pdf`);

      // Step 6: Restore
      elementsToHide.forEach(el => (el as HTMLElement).style.display = '');
      parent.insertBefore(content, nextSibling); // Put content back in original place
      document.body.removeChild(wrapper); // Clean up wrapper

      if (this.associateQueriesComponent) this.associateQueriesComponent.isGeneratingPdf = false;
      this.isDownloadingExcel = false;
    });
  }

}
