import { Injectable } from '@angular/core';
import { environment as env } from 'projects/reports/src/environments/environment';
import { DataService } from '../app/data.service';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;
const GET_COMMENT = `${REPORTS_HOST}/client/get-comments`;
const SEND_COMMENT = `${REPORTS_HOST}/client/send-comment`;

const INSERT_COMMENT = `${REPORTS_HOST}/client/comments/insert`;
const GET_COMMENTS = `${REPORTS_HOST}/client/comments/get`;

const GET_CLIENT_COMMENT_CODES = `${REPORTS_HOST}/client/get-comment-codes`;
const MARK_AS_READ = `${REPORTS_HOST}/client/instructions/mark-read`;

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(
    private dataService: DataService
  ) { }

  getCommentCodes() {
    return this.dataService.doGet(`${GET_CLIENT_COMMENT_CODES}`);
  }

  getComments(body: any) {
    return this.dataService.doPost(`${GET_COMMENTS}`, body);
  }

  sendComment(body: any) {
    return this.dataService.doPost(`${INSERT_COMMENT}`, body);
  }

  markAsRead(body: any) {
    return this.dataService.doPost(`${MARK_AS_READ}`, body);
  }
}
