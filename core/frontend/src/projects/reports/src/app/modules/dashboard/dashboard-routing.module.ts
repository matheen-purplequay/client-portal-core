import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { ConnectReportComponent } from './connect-report/connect-report.component';
import { WeeklyReportComponent } from './weekly-report/weekly-report.component';
import { NewslettersComponent } from './newsletters/newsletters.component';
import { AboutComponent } from './about/about.component';
import { ChatComponent } from './chat/chat.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { KnowledgeCenterComponent } from './knowledge-center/knowledge-center.component';
import { MyTeamComponent } from './my-team/my-team.component';
import { ItComponent } from './it/it.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: DashboardHomeComponent },
  { path: 'connect-reports', component: ConnectReportComponent },
  { path: 'weekly-reports', component: WeeklyReportComponent },
  { path: 'newsletters', component: NewslettersComponent },
  { path: 'knowledge-center', component: KnowledgeCenterComponent },
  { path: 'my-team', component: MyTeamComponent },
  { path: 'it', component: ItComponent },
  { path: 'faq', component: AboutComponent },
  { path: 'calendar', component: HolidaysComponent },
  { path: 'chat', component: ChatComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
