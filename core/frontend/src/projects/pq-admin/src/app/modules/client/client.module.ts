import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { ClientMasterComponent } from './client-master/client-master.component';
import { PqUiModule } from 'pq-ui';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ClientSetupComponent } from './client-setup/client-setup.component';
import { ClientTeamsComponent } from './client-teams/client-teams.component';
import { CompanyRulesComponent } from './company-rules/company-rules.component';
import { CompanySetupComponent } from './company-setup/company-setup.component';
import { ClientUserPermissionsComponent } from './client-user-permissions/client-user-permissions.component';
import { SimpleLoadingTextComponent } from '../../components/simple-loading-text/simple-loading-text.component';
import { ClientReviewersComponent } from './client-reviewers/client-reviewers.component';
import { ClientTestUsersComponent } from './client-test-users/client-test-users.component';

@NgModule({
  declarations: [
    ClientMasterComponent,
    ClientSetupComponent,
    ClientTeamsComponent,
    CompanyRulesComponent,
    CompanySetupComponent,
    ClientUserPermissionsComponent,
    ClientReviewersComponent,
    ClientTestUsersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PqUiModule,
    SharedModule,
    ClientRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClientModule { }
