import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { DataService } from '../app/base/data.service';
import { Observable, map } from 'rxjs';
import { routes } from 'projects/pq-admin/src/environments/routes';
import { StorageService } from '../app/storage/storage.service';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const CHECK_PDF_CLIENT = `${REPORTS_HOST}${routes.api_production.reports_api.check_pdf_client}`;

@Injectable({
  providedIn: 'root'
})
export class ReportCheckerService {

  constructor(
    private dataService: DataService
  ) {
   }

  checkReportClient(file: File, body: any, fileParam: string = 'file') {
    return this.dataService.doUploadFormData(`${CHECK_PDF_CLIENT}`, body, file, fileParam);
  }

}
