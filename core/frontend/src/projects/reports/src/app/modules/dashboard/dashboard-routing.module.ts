import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
  { path: '', redirectTo: 'workflow', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./dashboard-home/dashboard-home.module').then(m => m.DashboardHomeModule) },
  { path: 'overview', loadChildren: () => import('./dashboard-page/dashboard-page.module').then(m => m.DashboardPageModule) },
  { path: 'job-status', loadChildren: () => import('./job-status-view/job-status-view.module').then(m => m.JobStatusViewModule) },
  { path: 'production-report', loadChildren: () => import('./production-report/production-report.module').then(m => m.ProductionReportModule) },
  { path: 'turnaround-report', loadChildren: () => import('./turnaround-report/turnaround-report.module').then(m => m.TurnaroundReportModule) },
  { path: 'budget-overview', loadChildren: () => import('./budget-overview/budget-overview.module').then(m => m.BudgetOverviewModule) },
  { path: 'closed-jobs-feedback', loadChildren: () => import('./feedback/feedback.module').then(m => m.FeedbackModule) },
  { path: 'movement', loadChildren: () => import('./movement/movement.module').then(m => m.MovementModule) },
  { path: 'mom', loadChildren: () => import('./mom/mom.module').then(m => m.MOMModule) },
  { path: 'workflow', loadChildren: () => import('./workflow/workflow.module').then(m => m.WorkflowModule) },
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
