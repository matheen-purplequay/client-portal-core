import { Injectable, Query } from '@angular/core';
import { DataService } from '../../app/data.service';
import { environment as env } from 'projects/reports/src/environments/environment';
import { routes } from 'projects/reports/src/environments/routes';
import { BehaviorSubject } from 'rxjs';
import { MasterFiltersMeta, QueryFilters } from '../../../modules/dashboard/queries/models/queries';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const WM_HOST = env.api_production.hosts.wm_api_server;

// Query APIs
const GET_JOBS_WITH_QUERIES = `${WM_HOST}${routes.api_production.queries_api.get_jobs_with_queries}`;
const GET_QUERIES_FOR_JOB = `${WM_HOST}${routes.api_production.queries_api.get_queries_for_job}`;
const GET_SUB_QUERIES_FOR_JOB = `${WM_HOST}${routes.api_production.queries_api.get_sub_queries_for_job}`;
const SEARCH_QUERY_OR_JOB = `${WM_HOST}${routes.api_production.queries_api.search_query_or_job}`;
const SEND_QUERY_REPLY = `${WM_HOST}${routes.api_production.queries_api.send_query_reply}`;
const GET_QUERY_COUNTS = `${WM_HOST}${routes.api_production.queries_api.get_query_counts}`;
const DOWNLOAD_QUERIES = `${WM_HOST}${routes.api_production.queries_api.download_queries}`;
const DOWNLOAD_JOBS = `${WM_HOST}${routes.api_production.queries_api.download_jobs}`;

// Query Master APIs
const GET_QUERY_MASTER = `${WM_HOST}${routes.api_production.queries_api.get_query_master}`;
const GET_QUERY_MASTER_BY_ID = `${WM_HOST}${routes.api_production.queries_api.get_query_master_by_id}`;

// Query Approver APIs
const GET_QUERY_APPROVERS = `${WM_HOST}${routes.api_production.queries_api.get_query_approvers}`;
const ADD_QUERY_APPROVERS = `${WM_HOST}${routes.api_production.queries_api.insert_query_approvers}`;

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
    const body = ["query_status", "criticality", "category", "sub_category", "response_type"];
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
        
        // Emit the updated array back to the BehaviorSubject.
        this.queryFilters.next(currentFilters);
      },
      error: (err: any) => {}
    });
  }

  getMasterFilter(id: number) {
    return this.dataService.doGet(`${GET_QUERY_MASTER_BY_ID}/?id=${id}`);
  }

  getJobsWithQueries(user_id: number, client_id: number) {
    return this.dataService.doGet(`${GET_JOBS_WITH_QUERIES}?userId=${user_id}&clientId=${client_id}`);
  }

  getQueriesForJob(body: any) {
    return this.dataService.doPost(`${GET_QUERIES_FOR_JOB}`, body, false);
  }

  getSubQueriesForJob(body: any) {
    return this.dataService.doPost(`${GET_SUB_QUERIES_FOR_JOB}`, body, false);
  }

  searchQueryOrJob(searchTerm: string = '', pageNumber: number = 1) {
    return this.dataService.doGet(`${SEARCH_QUERY_OR_JOB}?jobname=${searchTerm}&pagenumber=${pageNumber}`);
  }

  sendQueryReply(body: any) {
    return this.dataService.doPost(`${SEND_QUERY_REPLY}`, body, false);
  }

  add_query_approvers(body: any) {
    return this.dataService.doPost(`${ADD_QUERY_APPROVERS}`, body);
  }

  getQueryMaster(body: any) {
    return this.dataService.doPost(`${GET_QUERY_MASTER}`, body, false);
  }

  getQueryApprovers(client_id: number) {
    return this.dataService.doGet(`${GET_QUERY_APPROVERS}?clientId=${client_id}`);
  }

  getQueryCounts(projectId: any) {
    return this.dataService.doGet(`${GET_QUERY_COUNTS}?projectId=${projectId}`);
  }

  downloadQueriesAsExcel(body: any) {
    return this.dataService.doGetAsBlobByPost(`${DOWNLOAD_QUERIES}`, body);
  }

  downloadJobsAsExcel(user_id: number, client_id: number) {
    return this.dataService.doGetAsBlob(`${DOWNLOAD_JOBS}?userId=${user_id}&clientId=${client_id}`);
  }
}