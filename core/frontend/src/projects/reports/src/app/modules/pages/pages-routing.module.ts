import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ByCarismaComponent } from './by-carisma/by-carisma.component';

const routes: Routes = [
  { path: '', redirectTo: 'by-carisma', pathMatch: 'full' },
  { path: 'by-carisma', component: ByCarismaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
