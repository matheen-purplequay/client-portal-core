import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppMasterComponent } from './app-master/app-master.component';
import { SharedModule } from '../shared/shared.module';
import { PqUiModule } from 'pq-ui';
import { AppUpdatesComponent } from './app-updates/app-updates.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';


@NgModule({
  declarations: [
    AppMasterComponent,
    AppUpdatesComponent
  ],
  imports: [
    CommonModule,
    PqUiModule,
    SharedModule,
    CKEditorModule,
    AppRoutingModule
  ]
})
export class AppModule { }
