import { Component, OnInit } from '@angular/core';
import { QueriesData, Queries, QueryRequestPayload, SubQueryRequestPayload } from '../../../models/queries';
import { ConfigService } from '../../../services/app/config.service';
import { DataService } from '../../../services/app/data.service';

const EMPTY_QUERY = -1;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  queries: QueriesData[] = [];
  selectedQuery: QueriesData = Queries.defaultQueriesData();
  subQueries: QueriesData[] = [];

  showNewQueryToolbar: boolean = false;
  showAddQueryPopup: boolean = false;
  showFilterPanel: boolean = false;
  isFiltersApplied: boolean = false;
  emptyQuery = EMPTY_QUERY;

  query = '';

  filtes: [] = [];
  
  constructor(
    private configService: ConfigService,
    private dataService: DataService
  ) { 
    this.setupAmbience();
  }

  ngOnInit(): void {
  }

  setupAmbience() {
    this.getQueries();
  }

  getQueries() {
    this.dataService.doGetJSONData('chat').subscribe((res: any) => {
      this.queries = res;
      this.getSubQueries();
    });
  }

  getSubQueries() {
    this.subQueries = [];
    this.dataService.doGetJSONData('subchat').subscribe((res: any) => {
      this.subQueries = res;
    });
  }

  checkIfSubQueryEmpty(): boolean {
    if(this.selectedQuery.userCode == this.emptyQuery) return true;
    else return false;
  }

  applyFilters() {
    this.showFilterPanel = false;
    this.isFiltersApplied = true;
  }

  clearFilters() {
    this.showFilterPanel = false;
    this.isFiltersApplied = false;
  }

  handleCallback(event: any) {
    switch(event.column.toLowerCase()) {
      case 'certificate':
        this.showAddQueryPopup = true;
        this.query = event.value;
        break;
      case 'actions':
        
        break;
    }
  }

  resetPopup() {
    this.query = '';
    this.showAddQueryPopup = false;
  }

}
