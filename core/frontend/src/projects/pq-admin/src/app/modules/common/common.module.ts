import { NgModule } from '@angular/core';
import { CommonModule as CM } from '@angular/common';
import { CommonRoutingModule } from './common-routing.module';
import { KnowledgeCenterComponent } from './knowledge-center/knowledge-center.component';
import { ItPolicyComponent } from './it-policy/it-policy.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { NewslettersComponent } from './newsletters/newsletters.component';
import { SharedModule } from '../shared/shared.module';
import { PqUiModule } from 'pq-ui';
import { CommonMasterComponent } from './common-master/common-master.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HolidaysComponent } from './holidays/holidays.component';


@NgModule({
  declarations: [
    KnowledgeCenterComponent,
    ItPolicyComponent,
    CalendarComponent,
    ContactFormComponent,
    NewslettersComponent,
    CommonMasterComponent,
    HolidaysComponent
  ],
  imports: [
    CM,
    SharedModule,
    PqUiModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonRoutingModule
  ]
})
export class CommonModule { }
