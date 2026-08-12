import { Injectable } from '@angular/core';
import { DataService } from '../app/base/data.service';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { routes } from 'projects/pq-admin/src/environments/routes';
import { Query, MasterFilterMeta, QueryFilters, MasterFiltersMeta, DraftQueryRequest, QueryReply, BulkApproveQueryRequest} from '../../modules/inbox/queries/models/queries';
import { BehaviorSubject } from 'rxjs';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const WM_HOST = env.api_production.hosts.wm_api_server;

// Query APIs
const GET_JOBS_WITH_QUERIES = `${WM_HOST}${routes.api_production.queries_api.get_jobs_with_queries}`;
const GET_QUERIES_FOR_JOB = `${WM_HOST}${routes.api_production.queries_api.get_queries_for_job}`;
const GET_SUB_QUERIES_FOR_JOB = `${WM_HOST}${routes.api_production.queries_api.get_sub_queries_for_job}`;
const SEARCH_QUERY_OR_JOB = `${WM_HOST}${routes.api_production.queries_api.search_query_or_job}`;
const GET_DRAFT_QUERIES = `${WM_HOST}${routes.api_production.queries_api.get_draft_queries}`;
const APPROVE_DRAFT_QUERY = `${WM_HOST}${routes.api_production.queries_api.approve_draft_query}`;
const REJECT_DRAFT_QUERY = `${WM_HOST}${routes.api_production.queries_api.reject_draft_query}`;
const ADD_QUERY = `${WM_HOST}${routes.api_production.queries_api.insert_query}`;
const CHECK_QUERY_EXISTS = `${REPORTS_HOST}${routes.api_production.queries_api.check_query_exists}`;
const SEND_QUERY_REPLY = `${WM_HOST}${routes.api_production.queries_api.send_query_reply}`;
const GET_QUERY_COUNTS = `${WM_HOST}${routes.api_production.queries_api.get_query_counts}`;
const RESOLVE_QUERY = `${WM_HOST}${routes.api_production.queries_api.resolve_query}`;
const BULK_APPROVE_DRAFT_QUERY = `${WM_HOST}${routes.api_production.queries_api.bulk_approve_queries}`;

// Query Tempaltes
const GET_QUERY_TEMPLATES = `${WM_HOST}${routes.api_production.queries_api.get_query_templates}`;
const GET_QUERY_TEMPLATE = `${WM_HOST}${routes.api_production.queries_api.get_query_template}`;
const INSERT_QUERY_TEMPLATE = `${WM_HOST}${routes.api_production.queries_api.insert_query_template}`;
const UPDATE_QUERY_TEMPLATE = `${WM_HOST}${routes.api_production.queries_api.update_query_template}`;

// Query Master APIs
const GET_QUERY_MASTER = `${WM_HOST}${routes.api_production.queries_api.get_query_master}`;
const GET_QUERY_MASTER_BY_ID = `${WM_HOST}${routes.api_production.queries_api.get_query_master_by_id}`;

// Query Approver APIs
const GET_QUERY_APPROVERS = `${ACCOUNTS_HOST}${routes.api_production.queries_api.get_query_approvers}`;
const ADD_QUERY_APPROVERS = `${ACCOUNTS_HOST}${routes.api_production.queries_api.insert_query_approvers}`;
const REMOVE_QUERY_APPROVERS = `${ACCOUNTS_HOST}${routes.api_production.queries_api.remove_query_approvers}`;
const GET_JOBS_FOR_APPROVERS = `${WM_HOST}${routes.api_production.queries_api.get_jobs_for_approvers}`;
const GET_QUERY_FOR_APPROVERS = `${WM_HOST}${routes.api_production.queries_api.get_queries_for_approvers}`;

@Injectable({
  providedIn: 'root'
})
export class QueriesService {

  job_filters: any[] = [];
  queryFilters: BehaviorSubject<MasterFiltersMeta> = new BehaviorSubject<MasterFiltersMeta>(MasterFiltersMeta.defaultMasterFiltersMeta());

  constructor(
    private dataService: DataService
  ) { 
    this.getAllMasterFilters();
  }

  getAllMasterFilters() {
    const body = ["query_status", "criticality", "category", "sub_category", "response_type", "job_processing_stage"];
    this.getQueryMaster(body).subscribe({
      next: (res: any) => {
        // Assuming QueryFiltersMeta has a 'values' property.
        let currentFilters: MasterFiltersMeta = MasterFiltersMeta.defaultMasterFiltersMeta();

        // Update the specific indices of the array.
        currentFilters.category.list = res.masters.category;
        currentFilters.sub_category.list = res.masters.sub_category;
        currentFilters.criticality.list = res.masters.criticality;
        currentFilters.query_status.list = res.masters.query_status;
        currentFilters.response_type.list = res.masters.response_type;
        currentFilters.processing_stage.list = res.masters.job_processing_stage;
        
        // Emit the updated array back to the BehaviorSubject.
        this.queryFilters.next(currentFilters);
      },
      error: (err: any) => {}
    });
  }

  getMasterFilter(id: number) {
    return this.dataService.doGet(`${GET_QUERY_MASTER_BY_ID}/?id=${id}`);
  }

  getJobsWithQueries(user_id: number, client_id: number, queryStatusId: number, queryCriticalityId: number, querycategoryId: number, querySubCategoryId: number) {
    return this.dataService.doGet(`${GET_JOBS_WITH_QUERIES}?userId=${user_id}&clientId=${client_id}&queryStatusId=${queryStatusId}&queryCriticalityId=${queryCriticalityId}&querycategoryId=${querycategoryId}&querySubCategoryId=${querySubCategoryId}`);
  }

  getQueriesForJob(body: any) {
    return this.dataService.doPost(`${GET_QUERIES_FOR_JOB}`, body, false);
  }

  getSubQueries(body: any) {
    return this.dataService.doPost(`${GET_SUB_QUERIES_FOR_JOB}`, body);
  }

  searchQueryOrJob(searchTerm: string = '', pageNumber: number = 1) {
    return this.dataService.doGet(`${SEARCH_QUERY_OR_JOB}?jobname=${searchTerm}&pagenumber=${pageNumber}`);
  }

  getDraftQueries(user_id: number, client_id: number) {
    return this.dataService.doPost(`${GET_DRAFT_QUERIES}/?userId=${user_id}&clientId=${client_id}`, {}, false);
  }
  
  getQueryTemplates() {
    return this.dataService.doGet(`${GET_QUERY_TEMPLATES}`);
  }

  getQueryTemplate(id: number) {
    return this.dataService.doGet(`${GET_QUERY_TEMPLATE}/?id=${id}`);
  }

  saveQueryTemplate(body: any) {
    return this.dataService.doPost(`${INSERT_QUERY_TEMPLATE}`, body, false)
  }

  updateQueryTemplate(body: any) {
    return this.dataService.doPost(`${UPDATE_QUERY_TEMPLATE}`, body, false)
  }

  addQuery(body: Query[]) {
    return this.dataService.doPost(`${ADD_QUERY}`, body, false);
  }

  checkIfQueryExists(body: any) {
    return this.dataService.doPost(`${CHECK_QUERY_EXISTS}`, body, false);
  }

  approveDraftQuery(body: DraftQueryRequest) {
    return this.dataService.doPost(`${APPROVE_DRAFT_QUERY}`, body, false);
  }
  
  rejectDraftQuery(body: DraftQueryRequest) {
    return this.dataService.doPost(`${REJECT_DRAFT_QUERY}`, body, false);
  }
  
  approveDraftSubQuery(body: QueryReply) {
    return this.dataService.doPost(`${APPROVE_DRAFT_QUERY}`, body, false);
  }
  
  rejectDraftSubQuery(body: QueryReply) {
    return this.dataService.doPost(`${REJECT_DRAFT_QUERY}`, body, false);
  }
  
  sendQueryReply(body: any) {
    return this.dataService.doPost(`${SEND_QUERY_REPLY}`, body, false);
  }

  getQueryMaster(body: any) {
    return this.dataService.doPost(`${GET_QUERY_MASTER}`, body, false);
  }

  getQueryApprovers(body: any) {
    return this.dataService.doPost(`${GET_QUERY_APPROVERS}`, body);
  }

  addQueryApprovers(body: any) {
    return this.dataService.doPost(`${ADD_QUERY_APPROVERS}`, body);
  }

  removeQueryApprovers(body: any) {
    return this.dataService.doPost(`${REMOVE_QUERY_APPROVERS}`, body);
  }

  getQueryCounts(project_id: number) {
    return this.dataService.doGet(`${GET_QUERY_COUNTS}/?projectId=${project_id}`);
  }

  resolveQuery(id: number) {
    return this.dataService.doGet(`${RESOLVE_QUERY}/?query_id=${id}`);
  }

  getApproverJobsWithQueries(user_id: number, client_id: number, queryStatusId: number, queryCriticalityId: number, querycategoryId: number, querySubCategoryId: number) {
    return this.dataService.doGet(`${GET_JOBS_FOR_APPROVERS}?userId=${user_id}&clientId=${client_id}&queryStatusId=${queryStatusId}&queryCriticalityId=${queryCriticalityId}&querycategoryId=${querycategoryId}&querySubCategoryId=${querySubCategoryId}`);
  }

  getDraftQueriesForApprovers(user_id: number, client_id: number) {
    return this.dataService.doPost(`${GET_QUERY_FOR_APPROVERS}/?userId=${user_id}&clientId=${client_id}`, {}, false);
  }


  bulkApproveDraftQuery(body: BulkApproveQueryRequest[]) {
    return this.dataService.doPost(`${BULK_APPROVE_DRAFT_QUERY}`, body, false);
  }
}