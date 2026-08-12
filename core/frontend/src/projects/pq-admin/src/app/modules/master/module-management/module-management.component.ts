import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModuleService } from '../../../services/app/master/module.service';
import { ToastService } from 'pq-ui';

interface Module {
  title: string;
  code: string;
  description: string;
  portal: "admin" | "client" | string
}

class Module {
  static defaultModule() {
    return {
      title: '',
      code: '',
      description: '',
      portal: 'admin'
    } as Module;
  }
}

@Component({
  selector: 'app-module-management',
  templateUrl: './module-management.component.html',
  styleUrls: ['./module-management.component.scss']
})
export class ModuleManagementComponent implements OnInit {

  @Output() moduleSelected = new EventEmitter<Module>();

  modules: Module[] = [];
  module: Module = Module.defaultModule();
  selectedModule: Module = Module.defaultModule();
  isModulesLoaded: boolean = false;
  isAddNewModule: boolean = false;

  moduleSearchTerm: string = '';

  constructor(
    private moduleService: ModuleService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.getAllModules();
  }

  getAllModules() {
    this.moduleService.getAllModules().subscribe((res: any) => {
      this.isModulesLoaded = true;
      if(res.status) {
        this.modules = res.data;
        this.selectedModule = res.data[0];
      }
    });
  }

  addModule() {
    this.moduleService.addModule(this.module).subscribe((res: any) => {
      if(res.status) {
        this.module = Module.defaultModule();
        this.toastService.show('Module added successfully', 'Added', 'success', true);
        this.getAllModules();
      }
    });
  }

  selectModule(module: Module) {
    this.selectedModule = module;
    this.moduleSelected.emit(module);
  }
}
