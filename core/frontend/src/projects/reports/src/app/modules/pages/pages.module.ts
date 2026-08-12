import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { PqUiModule } from 'pq-ui';
import { ByCarismaComponent } from './by-carisma/by-carisma.component';
import { PageMasterComponent } from './page-master/page-master.component';


@NgModule({
  declarations: [
    ByCarismaComponent,
    PageMasterComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PqUiModule,
    PagesRoutingModule
  ]
})
export class PagesModule { }
