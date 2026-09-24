import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PqUiModule } from 'pq-ui';
import { MOMComponent } from './mom.component';

const routes: Routes = [
  { path: '', component: MOMComponent }
];

@NgModule({
  declarations: [
    MOMComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PqUiModule,
    RouterModule.forChild(routes)
  ]
})
export class MOMModule { }
