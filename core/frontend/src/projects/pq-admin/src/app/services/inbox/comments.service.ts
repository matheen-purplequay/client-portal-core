import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { DataService } from '../app/base/data.service';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

const GET_COMMENT_CODES = `${REPORTS_HOST}/admin/comments/get-codes`;
const GET_COMMENT = `${REPORTS_HOST}/admin/comments/get`;
const GET_COMMENT_BY_JOB_ID = `${REPORTS_HOST}/admin/comments/get-by-job-id`;
const SEND_COMMENT = `${REPORTS_HOST}/admin/send-comment`;

// Instruction Status Updates
const COMMENT_STATUS_UPDATE = `${REPORTS_HOST}/admin/instructions/mark-read`;

// Instruction Notes
const GET_INSTRUCTION_NOTES = `${REPORTS_HOST}/admin/instructions/notes/get-notes`;
const SAVE_INSTRUCTION_NOTE = `${REPORTS_HOST}/admin/instructions/notes/save-note`;

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(
    private dataService: DataService
  ) { }

  getCommentCodes() {
    return this.dataService.doGet(`${GET_COMMENT_CODES}`);
  }

  getComments(body: any) {
    return this.dataService.doPost(`${GET_COMMENT}`, body);
  }
  
  sendComment(body: any) {
    return this.dataService.doPost(`${SEND_COMMENT}`, body);
  }
  
  getCommentsByJobId(body: any) {
    return this.dataService.doPost(`${GET_COMMENT_BY_JOB_ID}`, body);
  }

  updateCommentStatus(body: any) {
    return this.dataService.doPost(`${COMMENT_STATUS_UPDATE}`, body);
  }
  
  getInstructionNotes(body: any) {
    return this.dataService.doPost(`${COMMENT_STATUS_UPDATE}`, body);
  }
  
  saveInstructionNotes(body: any) {
    return this.dataService.doPost(`${COMMENT_STATUS_UPDATE}`, body);
  }
  
}
