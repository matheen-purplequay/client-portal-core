import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GreetingsComponent } from './greetings/greetings.component';

const routes: Routes = [
  { path: '', redirectTo: 'greetings', pathMatch: 'full' },
  { path: 'greetings', component: GreetingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EngagementRoutingModule { }
