import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KnowledgeCenterComponent } from './knowledge-center/knowledge-center.component';
import { ItPolicyComponent } from './it-policy/it-policy.component';
import { CalendarComponent } from './calendar/calendar.component';
import { NewslettersComponent } from './newsletters/newsletters.component';
import { HolidaysComponent } from './holidays/holidays.component';

const routes: Routes = [
  { path: '', redirectTo: 'newsletters', pathMatch: 'full' },
  { path: 'newsletters', component: NewslettersComponent },
  { path: 'knowledge-center', component: KnowledgeCenterComponent },
  { path: 'infotech-policies', component: ItPolicyComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'holidays', component: HolidaysComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonRoutingModule { }
