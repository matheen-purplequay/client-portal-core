import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PqUiModule } from 'pq-ui';
import { MovementComponent } from './movement.component';

const routes: Routes = [
  { path: '', component: MovementComponent }
];

@NgModule({
  declarations: [
    MovementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PqUiModule,
    RouterModule.forChild(routes)
  ]
})
export class MovementModule { }
