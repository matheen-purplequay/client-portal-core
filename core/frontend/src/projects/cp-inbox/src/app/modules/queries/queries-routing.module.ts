import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { QueriesHomeComponent } from "./queries-home/queries-home.component";

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: QueriesHomeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QueriesRoutingModule {}
