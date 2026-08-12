import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { QueriesRoutingModule } from "./queries-routing.module";
import { QueriesMasterComponent } from "./queries-master/queries-master.component";
import { PqUiModule } from "pq-ui";
import { QueriesHomeComponent } from "./queries-home/queries-home.component";

@NgModule({
  declarations: [QueriesMasterComponent, QueriesHomeComponent],
  imports: [CommonModule, PqUiModule, QueriesRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QueriesModule {}
