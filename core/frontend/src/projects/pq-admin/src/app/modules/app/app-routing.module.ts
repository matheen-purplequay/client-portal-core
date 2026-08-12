import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppUpdatesComponent } from '../app/app-updates/app-updates.component';

const routes: Routes = [
  { path: '', redirectTo: 'updates', pathMatch: 'full' },
  { path: 'updates', component: AppUpdatesComponent },
  { path: 'greetings', component: AppUpdatesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
