import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { environment as env } from 'projects/reports/src/environments/environment';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

const GET_HOLIDAYS = `${REPORTS_HOST}/get-holidays`;
const GET_UPCOMING_EVENTS = `${REPORTS_HOST}/get-upcoming-events`;
const GET_MY_TEAM = `${REPORTS_HOST}/get-my-team`;
const GET_KNOWLEDGE_CENTER = `${REPORTS_HOST}/get-articles`;
const GET_USEFUL_TOOLS = `${REPORTS_HOST}/get-useful-tools`;
const GET_USEFUL_TOOLS_CATEGORIES = `${REPORTS_HOST}/get-useful-tools-categories`;
const GET_ALL_IT_PDF = `${REPORTS_HOST}/get-all-it-pdf`;
const PREVIEW_IT_PDF = `${REPORTS_HOST}/it-preview`;
const DOWNLOAD_TOOL = `${REPORTS_HOST}/get-tool`;

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    private dataService: DataService
  ) { }

  getHolidaysData() {
    return this.dataService.doGet(`${GET_HOLIDAYS}`);
  }

  getUpcomingEvents() {
    return this.dataService.doGet(`${GET_UPCOMING_EVENTS}`);
  }

  getMyTeamData(body: any) {
    return this.dataService.doPost(`${GET_MY_TEAM}`, body);
  }

  getKnowledgeCenterData(body: any) {
    return this.dataService.doPost(`${GET_KNOWLEDGE_CENTER}`, body);
  }

  getUsefulToolsData(body: any) {
    return this.dataService.doPost(`${GET_USEFUL_TOOLS}`, body);
  }

  getUsefulToolsCategories() {
    return this.dataService.doGet(`${GET_USEFUL_TOOLS_CATEGORIES}`);
  }
  
  getAllITPDF() {
    return this.dataService.doGet(`${GET_ALL_IT_PDF}`);
  }

  getITPDFPreview(body: any) {
    return this.dataService.doPostAsArrayBuffer(`${PREVIEW_IT_PDF}`, body);
  }

  getTool(body: any) {
    return this.dataService.doGetAsBlobByPost(`${DOWNLOAD_TOOL}`, body);
  }
}
