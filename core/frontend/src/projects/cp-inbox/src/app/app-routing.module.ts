import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { QueriesMasterComponent } from "./modules/queries/queries-master/queries-master.component";

const routes: Routes = [
  {
    path: "queries",
    component: QueriesMasterComponent,
    loadChildren: () =>
      import("./modules/queries/queries.module").then((m) => m.QueriesModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
