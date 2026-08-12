import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemRoutingModule } from './system-routing.module';
import { SystemMasterComponent } from './system-master/system-master.component';
import { SystemHomeComponent } from './system-home/system-home.component';
import { SystemHealthComponent } from './components/system-health/system-health.component';
import { PqUiModule } from 'pq-ui';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  declarations: [
    SystemMasterComponent,
    SystemHomeComponent,
    SystemHealthComponent
  ],
  imports: [
    CommonModule,
    PqUiModule,
    SharedModule,
    SystemRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SystemModule { }
