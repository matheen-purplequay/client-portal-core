import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard-home', pathMatch: 'full' },
  {path: 'dashboard-home', component: DashboardHomeComponent, data: { activity: 'dashbaord' }}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
