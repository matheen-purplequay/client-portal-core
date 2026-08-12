import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsConnectComponent } from './reports-connect/reports-connect.component';
import { ReportsWeeklyComponent } from './reports-weekly/reports-weekly.component';
import { InvoicesComponent } from './invoices/invoices.component';

const routes: Routes = [
  { path: '', redirectTo: 'connect-report', pathMatch: 'full' },
  { path: 'connect', component: ReportsConnectComponent, data: { submodule: 'connect-report' } },
  { path: 'weekly', component: ReportsWeeklyComponent, data: { submodule: 'weekly-report' } },
  { path: 'invoices', component: InvoicesComponent, data: { submodule: 'invoices' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
