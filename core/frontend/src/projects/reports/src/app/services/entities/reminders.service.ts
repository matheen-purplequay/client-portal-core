import { Injectable } from '@angular/core';
import { environment as env } from 'projects/reports/src/environments/environment';
import { DataService } from '../app/data.service';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

const GET_REMINDERS = `${REPORTS_HOST}/client/reminders/get-by-user-id`;
const NEW_REMINDER = `${REPORTS_HOST}/client/reminders/add-new`;
const DELETE_REMINDER = `${REPORTS_HOST}/client/reminders/delete-reminder`;

@Injectable({
  providedIn: 'root'
})
export class RemindersService {

  constructor(
    private dataService: DataService
  ) { }

  getReminders(body: any) {
    return this.dataService.doPost(`${GET_REMINDERS}`, body);
  }

  newReminder(body: any) {
    return this.dataService.doPost(`${NEW_REMINDER}`, body);
  }
  
  deleteReminder(body: any) {
    return this.dataService.doPost(`${DELETE_REMINDER}`, body);
  }
}
