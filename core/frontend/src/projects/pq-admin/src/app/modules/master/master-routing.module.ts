import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MastersHomeComponent } from './masters-home/masters-home.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: MastersHomeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
