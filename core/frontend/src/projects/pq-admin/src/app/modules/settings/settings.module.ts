import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsMasterComponent } from './settings-master/settings-master.component';
import { PqUiModule } from 'pq-ui';
import { SharedModule } from '../shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';


@NgModule({
  declarations: [
    SettingsMasterComponent
  ],
  imports: [
    CommonModule,
    PqUiModule,
    SharedModule,
    CKEditorModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
