import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PqUiModule } from 'pq-ui';
import { FeedbackComponent } from './feedback.component';

const routes: Routes = [
  { path: '', component: FeedbackComponent }
];

@NgModule({
  declarations: [
    FeedbackComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PqUiModule,
    RouterModule.forChild(routes)
  ]
})
export class FeedbackModule { }
