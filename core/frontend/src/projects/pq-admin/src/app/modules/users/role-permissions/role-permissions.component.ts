import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../../services/entities/role.service';
import { SimpleTab } from 'pq-ui';

interface Role {
  id: number,
  title: string;
  code: string,
  description: string;
  heirarchy: number;
  group_order: string;
  type: string;
  category: string;
}

class Role {
  static defaultRole() {
    return {
      id: 0,
      title: "",
      code: "",
      description: "",
      heirarchy: 0,
      group_order: "",
      type: "",
      category: ""
    } as Role;
  }
}

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss']
})
export class RolePermissionsComponent implements OnInit {

  tabs = {
    all: { index: 1, label: 'All', data: 'all' },
    self: { index: 2, label: 'Self', data: 'self' },
    client: { index: 3, label: 'Client', data: 'client' }
  };

  filterTabs: {
    list: any[],
    selectedTab: SimpleTab
  } = {
    list: Object.values(this.tabs),
    selectedTab: this.tabs.all,
  };

  roles: { list: Role[], selectedRole: Role, isFetchingRoles: boolean } = {
    list: [],
    selectedRole: Role.defaultRole(),
    isFetchingRoles: false
  };

  permissions: any[] = [];

  constructor(
    private roleService: RoleService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.getRoles();
  }

  getRoles() {
    this.roles.isFetchingRoles = true;
    this.roleService.getAllRoles().subscribe((res: any) => {
      this.roles.isFetchingRoles = false;

      if(res.status) {
        this.roles.list = res.data;
        this.roles.selectedRole = this.roles.list[0];

        this.getRolePermission();
      }
    });
  }

  getRolesByType() {
    if(this.filterTabs.selectedTab.data && this.filterTabs.selectedTab.data != this.tabs.all.data) {
      const body = {
        type: this.filterTabs.selectedTab.data
      };
      this.roles.list = [];
      this.roleService.getRolesByType(body).subscribe((res: any) => {
        if(res.status) {
          this.roles.list = res.data;
          this.roles.selectedRole = this.roles.list[0];

          this.getRolePermission();
        }
      });
    }
  }

  selectRole(role: Role) {
    this.roles.selectedRole = role;
    this.getRolePermission();
  }

  getRolePermission() {
    const body = {
      role: this.roles.selectedRole.code,
      type: this.roles.selectedRole.type
    };
    this.permissions = [];
    this.roleService.getPermissionsByRole(body).subscribe((res: any) => {

      this.permissions = res.data;
    });
  }

  handleFilterTabs(event: SimpleTab) {
    this.filterTabs.selectedTab = event;
    if(event.index == this.tabs.all.index) this.getRoles();
    else this.getRolesByType();
  }

}
