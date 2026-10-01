import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PqUiModule } from 'pq-ui';
import { MOMComponent } from './mom.component';
import { FilterPanelPositionModule } from '../../../shared/directives/filter-panel-position.module';

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
    FilterPanelPositionModule,
    RouterModule.forChild(routes)
  ]
})
export class MOMModule { }
