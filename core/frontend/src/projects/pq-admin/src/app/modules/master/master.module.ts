import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterRoutingModule } from './master-routing.module';
import { PqUiModule } from 'pq-ui';
import { SharedModule } from '../shared/shared.module';
import { MastersMasterComponent } from './masters-master/masters-master.component';
import { MastersHomeComponent } from './masters-home/masters-home.component';
import { ModuleManagementComponent } from './module-management/module-management.component';
import { JobsMasterManagementComponent } from './jobs-master-management/jobs-master-management.component';
import { ColorsMasterManagementComponent } from './colors-master-management/colors-master-management.component';
import { MasterModuleComponent } from './master-module/master-module.component';


@NgModule({
  declarations: [
    MastersMasterComponent,
    MastersHomeComponent,
    ModuleManagementComponent,
    JobsMasterManagementComponent,
    ColorsMasterManagementComponent,
    MasterModuleComponent
  ],
  imports: [
    CommonModule,
    PqUiModule,
    SharedModule,
    MasterRoutingModule
  ]
})
export class MasterModule { }
