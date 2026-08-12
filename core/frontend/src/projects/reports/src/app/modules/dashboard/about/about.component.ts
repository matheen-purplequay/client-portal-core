import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/app/data.service';
import { ConfigService } from '../../../services/app/config.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { TipsPopupService } from '../../../shared/services/app/notifications/tips-popup.service';

interface Tab {
  index: number;
  label: string;
}

interface Tabs {
  tabs: Tab[];
  selectedTab: Tab;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  // General Variables
  MONTHLY_CONNECT = '1';
  about: { icon: string, title: string, text: string, code: string }[] = [];
  aboutTabs: Tabs = {
    tabs: [
      { index: 0, label: 'Client Portal Information' },
      // { index: 1, label: 'About Carisma' }
    ],
    selectedTab: { index: 0, label: 'Client Portal Information' }
  };

  verticals = {
    list: [
      { index: 1, name: 'Business Services' },
      { index: 2, name: 'SMSF' },
      { index: 5, name: 'Financial Planning' },
      { index: 6, name: 'Mortgage' },
      { index: 7, name: 'Design and Marketing' },
      { index: 8, name: 'Technology Group' }
    ],
    selectedVertical: { index: 1, name: 'Business Services' },
    keys: { key: 'index', value: 'name' }
  };

  // Variables for About Carisma
  selectedVertical: any;
  htmlTemplate: string = '';
  company_id: number = 0;
  dashboards: string[] = [];

  constructor(
    private dataService: DataService,
    private configService: ConfigService,
    private localStorageService: LocalStorageService,
    private tipsPopupService: TipsPopupService
  ) { 
  }

  ngOnInit(): void {
    this.company_id = this.localStorageService.getItem('userdata').company_id;
    this.dashboards = this.localStorageService.getItem('userdata').dashboards.split(',');
    this.aboutTabs.selectedTab = this.aboutTabs.tabs[0];
    this.getAboutContent();
    this.getSelectedVertical(this.verticals.selectedVertical);
  }

  getAboutContent() {
    this.dataService.doGetJSONData('about').subscribe((res: any) => {
      this.about = res;
    });
  }

  handleTabChange(event: any) {
    this.aboutTabs.selectedTab = event;
  }

  getSelectedVertical(event: any) {
    this.selectedVertical = event;
    this.verticals.selectedVertical = event;
    const template = (event.name as String).toLowerCase().split(' ').join('_');
    this.getVerticalHTMLTemplate(template);
  }

  getVerticalHTMLTemplate(template: string) {
    this.htmlTemplate = '';
    this.configService.getHTMLData(template).subscribe((res: any) => {
      this.htmlTemplate = res;
    });
  }
}
