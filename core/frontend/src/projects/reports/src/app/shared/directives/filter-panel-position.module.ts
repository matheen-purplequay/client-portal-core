import { NgModule } from '@angular/core';
import { FilterPanelPositionDirective } from './filter-panel-position.directive';

// Split out on its own (not declared in the widely-shared SharedModule,
// which broke every consumer the one time a component was added there
// directly — see git history) so every grid page can opt in cheaply.
@NgModule({
  declarations: [
    FilterPanelPositionDirective
  ],
  exports: [
    FilterPanelPositionDirective
  ]
})
export class FilterPanelPositionModule { }
