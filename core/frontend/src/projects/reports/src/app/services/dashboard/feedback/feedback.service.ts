import { Injectable } from '@angular/core';
import { environment as env } from 'projects/reports/src/environments/environment';
import { DataService } from '../../app/data.service';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

// Get feedback
const GET_FEEDBACK_CODES = `${REPORTS_HOST}/client/feedback-status/get-feedback-codes`;
const GET_FEEDBACK_STATUS = `${REPORTS_HOST}/client/feedback-status/get-feedback-status`;
const GET_FEEDBACK = `${REPORTS_HOST}/client/feedback-tab/get-feedback-by-job-id`;
const GET_FEEDBACK_COMMENTS = `${REPORTS_HOST}/client/feedback-status/get-feedback-comments`;

// Insert or Update feedback
const POST_FEEDBACK = `${REPORTS_HOST}/client/feedback-tab/save-feedback`;
const INSERT_FEEDBACK_COMMENTS = `${REPORTS_HOST}/client/feedback-status/insert-feedback-comments`;
const UPDATE_FEEDBACK_CLOSURE = `${REPORTS_HOST}/client/feedback-status/update-feedback-closure`;

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(
    private dataService: DataService
  ) { }

  getFeedbackCodes() {
    return this.dataService.doGet(`${GET_FEEDBACK_CODES}`);
  }

  getFeedbackStatus(body: any) {
    return this.dataService.doPost(`${GET_FEEDBACK_STATUS}`, body);
  }
  
  getFeedback(body: any) {
    return this.dataService.doPost(`${GET_FEEDBACK}`, body);
  }
  
  postFeedback(body: any) {
    return this.dataService.doPost(`${POST_FEEDBACK}`, body);
  }

  getFeedbackComments(body: any) {
    return this.dataService.doPost(`${GET_FEEDBACK_COMMENTS}`, body);
  }

  postFeedbackComments(body: any) {
    return this.dataService.doPost(`${INSERT_FEEDBACK_COMMENTS}`, body);
  }
  
  updateFeedbackClosure(body: any) {
    return this.dataService.doPost(`${UPDATE_FEEDBACK_CLOSURE}`, body);
  }
}
