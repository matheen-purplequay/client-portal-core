import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { DataService } from '../app/base/data.service';
import { routes } from 'projects/pq-admin/src/environments/routes';
import { ToastService } from 'pq-ui';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_NEWSLETTERS = `${REPORTS_HOST}${routes.api_production.common_api.get_newsletters}`;
const PREVIEW_NEWSLETTER = `${REPORTS_HOST}${routes.api_production.common_api.preview_newsletter}`;
const SAVE_NEWSLETTER = `${REPORTS_HOST}${routes.api_production.common_api.save_newsletter}`;
const UPDATE_NEWSLETTER = `${REPORTS_HOST}${routes.api_production.common_api.update_newsletter}`;
const DELETE_NEWSLETTER = `${REPORTS_HOST}${routes.api_production.common_api.delete_newsletter}`;
const GET_KNOWLEDGE_CENTER = `${REPORTS_HOST}${routes.api_production.common_api.get_knowledge_center}`;
const SAVE_KNOWLEDGE_CENTER = `${REPORTS_HOST}${routes.api_production.common_api.save_knowledge_center}`;
const GET_USEFUL_TOOLS = `${REPORTS_HOST}${routes.api_production.common_api.get_useful_tools}`;
const SAVE_USEFUL_TOOLS = `${REPORTS_HOST}${routes.api_production.common_api.save_useful_tools}`;
const GET_USEFUL_TOOLS_CATEGORIES = `${REPORTS_HOST}/get-useful-tools-categories`;
const GET_IT_POLICIES = `${REPORTS_HOST}${routes.api_production.common_api.get_it_policies}`;
const PREVIEW_IT_POLICY = `${REPORTS_HOST}${routes.api_production.common_api.preview_it_policy}`;
const SAVE_IT_POLICY = `${REPORTS_HOST}${routes.api_production.common_api.save_it_policy}`;
const GET_CALENDAR = `${REPORTS_HOST}${routes.api_production.common_api.get_calendar}`;
const SAVE_CALENDAR = `${REPORTS_HOST}${routes.api_production.common_api.save_calendar}`;
const GET_CONTACT_FORM_RECIPIENTS = `${REPORTS_HOST}${routes.api_production.common_api.get_contact_form_recipients}`;
const SAVE_CONTACT_FORM_RECIPIENTS = `${REPORTS_HOST}${routes.api_production.common_api.save_contact_form_recipients}`;

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    private dataService: DataService,
    private toastService: ToastService
  ) { }

  getNewsletters(body: any) {
    return this.dataService.doPost(`${GET_NEWSLETTERS}`, body);
  }

  getNewsletterPreview(body: any) {
    return this.dataService.doPostAsArrayBuffer(`${PREVIEW_NEWSLETTER}`, body);
  }

  saveNewsletter(body: any) {
    return this.dataService.doPost(`${SAVE_NEWSLETTER}`, body);
  }

  updateNewsletter(body: any) {
    return this.dataService.doPost(`${UPDATE_NEWSLETTER}`, body);
  }

  deleteNewsletter(body: any) {
    return this.dataService.doPost(`${DELETE_NEWSLETTER}`, body);
  }

  getArticles(body: any) {
    return this.dataService.doPost(`${GET_KNOWLEDGE_CENTER}`, body);
  }

  
  saveArticle(body: any) {
    return this.dataService.doPost(`${SAVE_KNOWLEDGE_CENTER}`, body);
  }

  getUsefulTools() {
    return this.dataService.doGet(`${GET_USEFUL_TOOLS}`);
  }

  saveUsefulTools(body: any) {
    return this.dataService.doPost(`${SAVE_USEFUL_TOOLS}`, body);
  }

  getUsefulToolsCategories() {
    return this.dataService.doGet(`${GET_USEFUL_TOOLS_CATEGORIES}`);
  }

  getITPolicies() {
    return this.dataService.doGet(`${GET_IT_POLICIES}`);
  }

  previewITPolicy(body: any) {
    return this.dataService.doPostAsArrayBuffer(`${PREVIEW_IT_POLICY}`, body);
  }

  saveITPolicy(body: any, file: File, fileParam: string = 'policy') {
    return this.dataService.doUploadFormData(`${SAVE_IT_POLICY}`, body, file, fileParam);
  }

  getCalendar() {
    return this.dataService.doGet(`${GET_CALENDAR}`);
  }

  saveCalendar(body: any) {
    return this.dataService.doPost(`${SAVE_CALENDAR}`, body);
  }

  getContactFormRecepients(body: any) {
    return this.dataService.doPost(`${GET_CONTACT_FORM_RECIPIENTS}`, body);  
  }
  
  saveContactFormRecipients(body: any) {
    return this.dataService.doPost(`${SAVE_CONTACT_FORM_RECIPIENTS}`, body);
  }

  copyMessage(val: string){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    alert('Copied to clipboard');
  }
}
