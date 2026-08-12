import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsMasterComponent } from './modules/reports/reports-master/reports-master.component';
import { AuthenticationMasterComponent } from './modules/authentication/authentication-master/authentication-master.component';
import { CommonMasterComponent } from './modules/common/common-master/common-master.component';
import { UserMasterComponent } from './modules/users/user-master/user-master.component';
import { InboxMasterComponent } from './modules/inbox/inbox-master/inbox-master.component';
import { MastersMasterComponent } from './modules/master/masters-master/masters-master.component';
import { SettingsMasterComponent } from './modules/settings/settings-master/settings-master.component';
import { DashboardMasterComponent } from './modules/dashboard/dashboard-master/dashboard-master.component';
import { ClientMasterComponent } from './modules/client/client-master/client-master.component';
import { SystemMasterComponent } from './modules/system/system-master/system-master.component';
import { AccountMasterComponent } from './modules/account/account-master/account-master.component';
import { AppMasterComponent } from './modules/app/app-master/app-master.component';

const routes: Routes = [
  {  path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login', component: AuthenticationMasterComponent,
    loadChildren: () => import('./modules/authentication/authentication.module').then(m => m.AuthenticationModule),
    data: { activity: 'login' }
  },
  {
    path: 'reports', component: ReportsMasterComponent,
    loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule),
    data: { activity: 'reports' }
  },
  {
    path: 'clients', component: ClientMasterComponent,
    loadChildren: () => import('./modules/client/client.module').then(m => m.ClientModule),
    data: { activity: 'client-admin' }
  },
  {
    path: 'common', component: CommonMasterComponent,
    loadChildren: () => import('./modules/common/common.module').then(m => m.CommonModule),
    data: { activity: 'common' }
  },
  {
    path: 'users', component: UserMasterComponent,
    loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule),
    data: { activity: 'users' }
  },
  {
    path: 'inbox', component: InboxMasterComponent,
    loadChildren: () => import('./modules/inbox/inbox.module').then(m => m.InboxModule),
    data: { activity: 'inbox' }
  },
  {
    path: 'masters', component: MastersMasterComponent,
    loadChildren: () => import('./modules/master/master.module').then(m => m.MasterModule),
    data: { activity: 'masters' }
  },
  {
    path: 'app', component: AppMasterComponent,
    loadChildren: () => import('./modules/app/app.module').then(m => m.AppModule),
    data: { activity: 'masters' }
  },
  {
    path: 'settings', component: SettingsMasterComponent,
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
    data: { activity: 'masters' }
  },
  {
    path: 'system', component: SystemMasterComponent,
    loadChildren: () => import('./modules/system/system.module').then(m => m.SystemModule),
    data: { activity: 'system' }
  },
  {
    path: 'dashboard', component: DashboardMasterComponent,
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    data: { activity: 'masters' }
  },
  {
    path: 'account', component: AccountMasterComponent,
    loadChildren: () => import('./modules/account/account.module').then(m => m.AccountModule),
    data: { activity: 'account' }
  },
  {
    path: 'logout', component: AuthenticationMasterComponent,
    loadChildren: () => import('./modules/authentication/authentication.module').then(m => m.AuthenticationModule),
    data: { activity: 'logout' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
