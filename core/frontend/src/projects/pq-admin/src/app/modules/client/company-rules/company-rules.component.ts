import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataService } from '../../../services/app/base/data.service';
import { RulesService } from '../../../services/app/base/rules.service';
import { MasterService } from '../../../services/app/base/master.service';
import { ToastService } from 'pq-ui';

interface Rule {
  id: string;
  title: string;
  value: string;
  values: { [key: string]: string }[]
}

interface Sections {
  title: string;
  rules: Rule[]
}

@Component({
  selector: 'app-company-rules',
  templateUrl: './company-rules.component.html',
  styleUrls: ['./company-rules.component.scss']
})
export class CompanyRulesComponent implements OnInit {
  
  @Output() edited: EventEmitter<boolean> = new EventEmitter(false);
  
  @Input() verticals: any;
  @Input() selectedClient: any;
  @Input() dashboards: string = '';

  sections: Sections[] = [];
  originalSections: Sections[] = [];
  selectedRule: Rule | null = null;
  doesRulesExists: boolean = false;

  // New Rules
  rules: any[] = [];
  changedRules: { [key: string]: string }[] = [];

  // Loading Variables
  isFetchingRules: boolean = false;
  isSavingRules: boolean = false;
  isCreatingRules: boolean = false;
  
  // Dropdown Variables
  dashboardType: {
    list: any[], selectedDashboardType: { index: number, label: string }, keys: { key: string, value: string }
  } = {
    list: [],
    selectedDashboardType: { index: 0, label: '' },
    keys: { key: 'code', value: 'title' }
  };

  services: {
    list: any[], selectedService: { wm_vertical_id: number, title: string }, keys: { key: string, value: string }
  } = {
    list: [],
    selectedService: { wm_vertical_id: 0, title: 'Choose a vertical' },
    keys: { key: 'wm_vertical_id', value: 'title' }
  };

  isEdited: boolean = false;
  isDashboardLoaded: boolean = false;

  constructor(
    private dataService: DataService,
    private rulesService: RulesService,
    private masterService: MasterService,
    private toastService: ToastService
  ) { 
  }

  ngOnInit(): void {
    this.services.list = this.verticals;
    this.services.selectedService = this.services.list[0];
    
    this.setupAmbience();
  }

  setupAmbience() {
    this.getDashboardMasterById();
  }

  getDashboardMasterById() {
    this.isDashboardLoaded = true;
    const body = {
      dashboard_ids: this.dashboards
    };
    this.dashboardType.list = [];
    this.masterService.getDashbaordMasterById(body).subscribe({
      next: (res: any) => {
        this.isDashboardLoaded = false;
        res.data.forEach((data: any) => {
          this.dashboardType.list.push({
            index: data.code,
            label: data.title
          });
        });
        if(this.dashboardType.list.length > 0) {
          this.dashboardType.selectedDashboardType = this.dashboardType.list[0];
          this.getRulesMaster();
        } 
      },
      error: (error: any) => {
        this.isDashboardLoaded = false;
      }
    });
  }

  getRulesMaster() {
    this.isFetchingRules = true;
    this.rules = [];
    this.rulesService.getRuleMaster().subscribe((res: any) => {
      this.isFetchingRules = false;
      this.rules = Object.values(res.data);
      this.getRulesByClient();
    });
  }

  getRulesByClient() {
    this.isFetchingRules = true;
    this.doesRulesExists = false;
    this.sections = [];
    this.originalSections = [];
    this.changedRules = [];

    const body = {
      client_id: this.selectedClient.id,
      vertical_id: this.services.selectedService.wm_vertical_id,
      dashboard_id: this.dashboardType.selectedDashboardType.index
    };

    this.rulesService.getRules(body).subscribe({
      next: (res: any) => {
        this.isFetchingRules = false;
        this.doesRulesExists = true;
        this.changedRules = JSON.parse(res.data.rules);
      },
      error: (err: any) => {
        this.isFetchingRules = false;
        this.doesRulesExists = false;
      }
    });
  }

  setRule(key: string, value: string, resetValue: string) {
    this.emitIsEdited(true);
    const {ruleExists, index} = this.checkRule(key);
    if(ruleExists) {
      if(resetValue != value) this.changedRules[index] = { [key]: value };
      else this.changedRules.splice(index, 1);
    }
    else this.changedRules.push({ [key]: value });
  }

  getRuleIndex(key: string) {
    const keys = this.changedRules.map(function(o) { return Object.keys(o)[0] });
    const index = keys.findIndex(k => k == key);
    return index;
  }

  checkRule(key: string) {
    const index = this.getRuleIndex(key);
    const flag = (index > -1);
    return { ruleExists: flag, index: index };
  }

  checkRuleValue(key: string) {
    const index = this.getRuleIndex(key);
    const flag = (index > -1);
    if(flag) return (this.changedRules[index][key] == '1');
    else return true;
  }

  saveRule() {
    this.isSavingRules = true;
    const body = {
      client_id: this.selectedClient.id,
      service_id: this.services.selectedService.wm_vertical_id,
      dashboard_id: this.dashboardType.selectedDashboardType.index,
      rules: JSON.stringify(this.changedRules)
    };


    this.rulesService.setRulesByClient(body).subscribe({
      next: (res: any) => {
        this.isSavingRules = false;
        this.emitIsEdited(false);
        this.toastService.show('Updated rules for the client', 'Rules updated', 'success', true);
      },
      error: (err: any) => {
        this.emitIsEdited(false);
        this.isSavingRules = false;
      }
    });
  }

  resetRulesForClient() {
    this.isCreatingRules = true;
    const body = {
      client_id: this.selectedClient.id
    };

    this.rulesService.resetRulesForClient(body).subscribe({
      next: (res: any) => {
        this.isCreatingRules = false;
        this.emitIsEdited(false);
        this.toastService.show(`Settings created for ${this.selectedClient.name}`, 'Settings created', 'success', true);
        this.setupAmbience();
      },
      error: (error: any) => {
        this.isCreatingRules = false;
        this.toastService.show(`Something went wrong while creating settings for ${this.selectedClient.name}`, 'Something went wrong', 'warning', true);
      }
    });
  }

  saveRules() {
    this.isSavingRules = true;
    const body = {
      client_id: this.selectedClient.id,
      vertical_id: this.services.selectedService.wm_vertical_id,
      dashboard_id: this.dashboardType.selectedDashboardType.index,
      rules: this.sections
    };

    this.rulesService.saveRulesByClient(body).subscribe({
      next: (res: any) => {
        this.isSavingRules = false;
        this.emitIsEdited(false);
        this.getRulesByClient();
        this.toastService.show(`Settings updated for ${this.selectedClient.name}`, 'Updated', 'success', true);
      },
      error: (error: any) => {
        this.isSavingRules = false;
        this.emitIsEdited(false);
        this.toastService.show(`Something went wrong while updating settings for ${this.selectedClient.name}`, 'Something went wrong', 'warning', true);
      }
    });
  }

  emitIsEdited(isEdited: boolean) {
    this.isEdited = isEdited;
    this.edited.emit(this.isEdited);
  }

}
