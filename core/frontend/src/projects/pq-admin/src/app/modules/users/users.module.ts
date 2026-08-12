import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserMasterComponent } from './user-master/user-master.component';
import { PqUiModule } from 'pq-ui';
import { SharedModule } from '../shared/shared.module';
import { RolePermissionsComponent } from './role-permissions/role-permissions.component';
import { ClientMappingComponent } from './client-mapping/client-mapping.component';
import { ObjectFilterPipe } from '../../utilities/tools/object-filter.pipe';
import { ClientUsersComponent } from './client-users/client-users.component';


@NgModule({
  declarations: [
    UserListComponent,
    UserMasterComponent,
    RolePermissionsComponent,
    ClientMappingComponent,
    ClientUsersComponent
  ],
  imports: [
    CommonModule,
    PqUiModule,
    SharedModule,
    UsersRoutingModule
  ],
  providers: [ObjectFilterPipe]
})
export class UsersModule { }
