import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeLandingComponent } from './home-landing.component';

const routes: Routes = [
  { path: '', component: HomeLandingComponent }
];

@NgModule({
  declarations: [
    HomeLandingComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class HomeLandingModule { }
