import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardBsMovementComponent } from './dashboard-bs-movement/dashboard-bs-movement.component';

// Extracted into its own module so it can be shared between DashboardHomeComponent's
// "Movement" tab and the standalone /dashboard/job-status route, without pulling
// DashboardBsMovementComponent's chunk into modules that don't need it.
@NgModule({
  declarations: [
    DashboardBsMovementComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DashboardBsMovementComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MovementWidgetModule { }
