import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardMasterComponent } from './modules/dashboard/dashboard-master/dashboard-master.component';
import { AuthenticationMasterComponent } from './modules/authentication/authentication-master/authentication-master.component';
import { ReportsMasterComponent } from './modules/reports/reports-master/reports-master.component';
import { AccountMasterComponent } from './modules/account/account-master/account-master.component';
import { AuthGuard } from './guards/auth.guard';
import { SystemMasterComponent } from './modules/system/system-master/system-master.component';
import { PageMasterComponent } from './modules/pages/page-master/page-master.component';
import { PageTemplateComponent } from './layouts/page-template/page-template.component';
import { EngagementMasterComponent } from './modules/engagement/engagement-master/engagement-master.component';

const routes: Routes = [
  {
    path: '', component: AuthenticationMasterComponent,
    loadChildren: () => import('./modules/authentication/authentication.module').then(m => m.AuthenticationModule),
    data: { activity: 'login' }
  },
  {
    path: 'login', component: AuthenticationMasterComponent,
    loadChildren: () => import('./modules/authentication/authentication.module').then(m => m.AuthenticationModule),
    data: { activity: 'login' }
  },
  {
    path: 'login/:company', component: AuthenticationMasterComponent,
    loadChildren: () => import('./modules/authentication/authentication.module').then(m => m.AuthenticationModule),
    data: { activity: 'login' }
  },
  { 
    path: 'dashboard', component: DashboardMasterComponent,
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    data: { activity: 'dashboard' },
    canActivate: [AuthGuard]
  },
  { 
    path: 'account', component: AccountMasterComponent,
    loadChildren: () => import('./modules/account/account.module').then(m => m.AccountModule),
    data: { activity: 'account' },
    canActivate: [AuthGuard]
  },
  {
    path: 'reports', component: ReportsMasterComponent,
    loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule),
    data: { activity: 'reports' },
    canActivate: [AuthGuard]
  },
  {
    path: 'system', component: SystemMasterComponent,
    loadChildren: () => import('./modules/system/system.module').then(m => m.SystemModule),
    data: { activity: 'system' }
  },
  {
    path: 'pages', component: PageMasterComponent,
    loadChildren: () => import('./modules/pages/pages.module').then(m => m.PagesModule),
    data: { activity: 'pages' }
  },
  {
    path: 'engage', component: EngagementMasterComponent,
    loadChildren: () => import('./modules/engagement/engagement.module').then(m => m.EngagementModule),
    data: { activity: 'engagement' }
  },
  {
    path: 'logout', component: AuthenticationMasterComponent,
    loadChildren: () => import('./modules/authentication/authentication.module').then(m => m.AuthenticationModule),
    data: { activity: 'logout' }
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
