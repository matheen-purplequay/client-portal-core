import { Injectable } from '@angular/core';
import { DataService } from '../app/base/data.service';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { routes } from 'projects/pq-admin/src/environments/routes';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_PROFILE_DATA = `${ACCOUNTS_HOST}${routes.api_production.account_api.get_profile_data}`;
const GET_PROFILE_PICTURE_BY_USER_ID = `${ACCOUNTS_HOST}${routes.api_production.account_api.get_profile_picture_by_user_id}`;
const SAVE_PROFILE_PICTURE = `${ACCOUNTS_HOST}${routes.api_production.account_api.save_profile_picture}`;

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(
    private dataService: DataService
  ) { }

  getProfileData(body: any) {
    return this.dataService.doPost(`${GET_PROFILE_DATA}`, body);
  }

  getProfilePictureByUserId(body: any) {
    return this.dataService.doPost(`${GET_PROFILE_PICTURE_BY_USER_ID}`, body);
  }

  saveProfilePhoto(body: any, file: File, fileParam: string = 'photo') {
    return this.dataService.doUploadFormData(`${SAVE_PROFILE_PICTURE}`, body, file, fileParam);
  }

}
