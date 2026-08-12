import { Injectable } from '@angular/core';
import { DataService } from '../app/base/data.service';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { routes } from 'projects/pq-admin/src/environments/routes';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_FEEDBACK_BY_USER_ID = `${REPORTS_HOST}${routes.api_production.feedback_api.get_feedback_by_user_id}`;
const GET_FEEDBACK_BY_JOB_ID = `${REPORTS_HOST}${routes.api_production.feedback_api.get_feedback_by_job_id}`;
const FEEDBACK_CLOSURE = `${REPORTS_HOST}${routes.api_production.feedback_api.feedback_closure}`;

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(
    private dataService: DataService
  ) { }

  getFeedbackByUserId(body: any) {
    return this.dataService.doPost(`${GET_FEEDBACK_BY_USER_ID}`, body);
  }

  getFeedbackByJobId(body: any) {
    return this.dataService.doPost(`${GET_FEEDBACK_BY_JOB_ID}`, body);
  }

  updateFeedbackClosure(body: any) {
    return this.dataService.doPost(`${FEEDBACK_CLOSURE}`, body);
  }

}
