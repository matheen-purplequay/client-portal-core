import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EngagementRoutingModule } from './engagement-routing.module';
import { GreetingsComponent } from './greetings/greetings.component';
import { EngagementMasterComponent } from './engagement-master/engagement-master.component';
import { PqUiModule } from 'pq-ui';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    GreetingsComponent,
    EngagementMasterComponent
  ],
  imports: [
    CommonModule,
    PqUiModule,
    SharedModule,
    EngagementRoutingModule
  ]
})
export class EngagementModule { }
