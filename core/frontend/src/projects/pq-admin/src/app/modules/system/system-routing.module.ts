import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemHomeComponent } from './system-home/system-home.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: SystemHomeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemRoutingModule { }
