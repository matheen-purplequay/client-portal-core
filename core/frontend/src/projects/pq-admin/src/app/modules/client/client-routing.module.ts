import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientSetupComponent } from './client-setup/client-setup.component';
import { CompanySetupComponent } from './company-setup/company-setup.component';
import { ClientUserPermissionsComponent } from './client-user-permissions/client-user-permissions.component';
import { ClientTeamsComponent } from './client-teams/client-teams.component';

const routes: Routes = [
  { path: '', redirectTo: 'company', pathMatch: 'full' },
  { path: 'company', component: CompanySetupComponent },
  { path: 'users', component: ClientSetupComponent },
  { path: 'user-permissions', component: ClientUserPermissionsComponent },
  { path: 'teams', component: ClientTeamsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
