import * as CryptoJS from 'crypto-js';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { SystemService } from '../../../services/app/system/system.service';
import { ToastService } from 'pq-ui';

@Component({
  selector: 'app-app-updates',
  templateUrl: './app-updates.component.html',
  styleUrls: ['./app-updates.component.scss']
})
export class AppUpdatesComponent implements OnInit {

  public Editor = ClassicEditor;
  public config = {
    placeholder: 'Add changelog here...',
    disableNativeSpellChecker: false
  };

  appList: {id: number, name: string}[] = [];

  filterApp = {
    list: this.appList,
    selectedApp: { id: 0, name: '' },
    keys: { key: 'id', value: 'name' }
  };

  subAppList: {id: number, name: string}[] = [];

  filterSubApp = {
    list: this.subAppList ,
    selectedApp: { id: 0, name: '' },
    keys: { key: 'id', value: 'name' }
  };

  releaseVersionList = {
    major: { index: 1, label: 'Major Version' },
    minor: { index: 2, label: 'Minor Version' }
  };

  releaseVersion = {
    list: Object.values(this.releaseVersionList),
    selectedRelease: this.releaseVersionList.major
  };

  title: string = '';
  notes: string = '';

  appUpdates: any[] = [];
  updateId: any;
  selectedUpdateContent: any;
  isFetchtingFilters: Boolean = false;
  isFetchingUpdates: Boolean = false;
  isFetchingUpdate: Boolean = false;
  updatesList: Boolean = false;

  isEditMode: boolean = false;
  isSavingUpdate: boolean = false;
  isActivatingUpdate: boolean = false;
  isDeletingUpdate: boolean = false;
  editPage: 0 | 1 = 0;

  constructor(
    private systemService: SystemService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getPortals();
  }

  getPortals() {
    this.isFetchtingFilters = true;
    this.systemService.getAllPortals().subscribe({
      next: (res: any) => {
        this.isFetchtingFilters = false;
        if(res.status) {
          this.filterApp.list = [...res.data];
          this.filterApp.selectedApp = this.filterApp.list[0];
          this.getSubPortals();
        }
      },
      error: (err: any) => {
        this.isFetchtingFilters = false;
      }
    });
  }

  getSubPortals() {
    this.isFetchtingFilters = true;
    this.systemService.getAllSubPortals().subscribe({
      next: (res: any) => {
        this.isFetchtingFilters = false;
        if(res.status) {
          this.filterSubApp.list = [...res.data];
          this.filterSubApp.selectedApp = this.filterSubApp.list[0];
          this.getAppUpdates();
        }
      },        
      error: (err: any) => {
        this.isFetchtingFilters = false;
      }
    });
  }

  getAppUpdates() {
    this.isFetchingUpdates = true;
    const body = {
      portal_id: this.filterApp.selectedApp.id,
      sub_portal_id: this.filterSubApp.selectedApp.id,
      is_approved: 1,
      is_active: 1
    };
    this.systemService.getAppUpdates(body).subscribe({
      next: (res: any) => {
        this.isFetchingUpdates = false;
        if(res.status) {
          this.appUpdates = res.data;
          this.setSelectedUpdate(this.appUpdates[0]);
        } 
      },
      error: (err: any) => {
        this.isFetchingUpdates = false;
      }
    });
  }

  setSelectedUpdate(updateId: any) {
    this.updateId = updateId;
    this.getUpdate(updateId);
  }

  getUpdate(update: any) {
    this.selectedUpdateContent = update;
  }

  saveAppUpdates() {
    this.isSavingUpdate = true;
    const body = {
      portal_id: this.filterApp.selectedApp.id,
      sub_portal_id: this.filterSubApp.selectedApp.id,
      title: this.title,
      notes: this.notes
    };

    this.systemService.saveAppUpdates(body).subscribe({
      next: (res: any) => {
        this.isSavingUpdate = false;
        this.toastService.show('Release saved. After approval, the release will be shown in the portal.', 'Release saved', 'success', true);
        this.getAppUpdates();
      },
      error: (err: any) => {
        this.isSavingUpdate = false;
      }
    });
  }

  activateUpdate() {
    this.isActivatingUpdate = true;
    const body = {
      update_id: this.selectedUpdateContent.id
    };

    this.systemService.activateUpdate(body).subscribe({
      next: (res: any) => {
        this.isActivatingUpdate = false;
        this.toastService.show('Release activated', 'Release activated', 'success', true);
      },
      error: (err: any) => {
        this.isActivatingUpdate = false;
      }
    });
  }

  deleteUpdate() {
    this.isDeletingUpdate = true;
    const body = {
      update_id: this.selectedUpdateContent.id
    };

    this.systemService.deleteUpdate(body).subscribe({
      next: (res: any) => {
        this.isDeletingUpdate = false;
        this.toastService.show('Release deleted', 'Release deleted', 'success', true);
        this.setupAmbiance();
      },
      error: (err: any) => {
        this.isDeletingUpdate = false;
      }
    });
  }

}
