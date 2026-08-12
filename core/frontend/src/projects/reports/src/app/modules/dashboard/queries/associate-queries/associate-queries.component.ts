import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Query, CRITICALITIES, MasterFilter, MasterFilterKeys, MasterFiltersMeta, MAX_ATTACHMENT_LIMIT, MAX_QUERY_LIMIT, QueryFilters } from '../models/queries';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { SimpleTab } from 'pq-ui';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from 'projects/reports/src/app/services/app/storage/local-storage.service';
import { QueriesService } from 'projects/reports/src/app/services/dashboard/queries/queries.service';

@Component({
  selector: 'app-associate-queries',
  templateUrl: './associate-queries.component.html',
  styleUrls: ['./associate-queries.component.scss']
})
export class AssociateQueriesComponent implements OnInit {

  @Output() querySelected = new EventEmitter<any>();
  @Output() queryUnSelected = new EventEmitter<any>();
  @Output() goBackToJobs = new EventEmitter<any>();
  @Input() refreshQueries: BehaviorSubject<QueryFilters> = new BehaviorSubject<QueryFilters>(QueryFilters.defaultQueryFilters());
  @Input() masterFilters: MasterFiltersMeta = MasterFiltersMeta.defaultMasterFiltersMeta();
  @Input() job: any;
  @Input() queries: Query[] = [];

  public Editor = ClassicEditor;
  public queryReplyEditorConfig = {
    placeholder: "Would you like to provide additional details? Share them here.",
    toolbar: {
      items: [
        'undo', 'redo',
        '|', 'heading',
        '|', 'bold', 'italic',
        '|', 'link', 'insertTable', 'blockQuote',
        '|', 'bulletedList', 'numberedList', 'outdent', 'indent'
      ]
    },
  }

  public newQueryEditorConfig = {
    placeholder: "Add your description here. Please be brief and clear.",
    toolbar: {
      items: [
        'undo', 'redo',
        '|', 'heading',
        '|', 'bold', 'italic',
        '|', 'link', 'insertTable', 'blockQuote',
        '|', 'bulletedList', 'numberedList', 'outdent', 'indent'
      ]
    },
  }
  
  maxQueryLimit = MAX_QUERY_LIMIT;
  selectedNewQuery: Query = Query.defaultQuery();
  showNewQueryPopup: boolean = false;

  query: {isQuerySelected: boolean, selectedQuery: Query } = {
    isQuerySelected: false,
    selectedQuery: Query.defaultQuery()
  };

  maxAttachments = MAX_ATTACHMENT_LIMIT;

  categories: { list: MasterFilter[], selectedCategory: MasterFilter, keys: MasterFilterKeys } = {
    list: [],
    selectedCategory: MasterFilter.defaultMasterFilter(),
    keys: MasterFilterKeys
  }

  subCategories: { list: MasterFilter[], selectedSubCategory: MasterFilter, keys: MasterFilterKeys } = {
    list: [],
    selectedSubCategory: MasterFilter.defaultMasterFilter(),
    keys: MasterFilterKeys
  };

  criticalities = {
    list: CRITICALITIES,
    keys: MasterFilterKeys,
    selectedCriticality: CRITICALITIES[0],
    level: CRITICALITIES[0].level,
  };

  queryFilters: QueryFilters = QueryFilters.defaultQueryFilters();

  newQueryResponseType: { tabs: SimpleTab[], selectedTab: SimpleTab } = {
    tabs: [
      { index: 0, label: 'Text' },
      { index: 1, label: 'Date' },
      { index: 2, label: 'Yes or No' }
    ],
    selectedTab: { index: 0, label: 'Text' }
  };

  doesReplyQueryRequiresResponse: boolean = false;
  replyQueryResponseType: { tabs: SimpleTab[], selectedTab: SimpleTab } = { 
    tabs: [
      { index: 0, label: 'Text' },
      { index: 1, label: 'Date' },
      { index: 2, label: 'Yes or No' }
    ],
    selectedTab: { index: 0, label: 'Text' }
  };

  user: any;

  constructor(
    private localStorageService: LocalStorageService,
    private queriesService: QueriesService
  ) { }

  ngOnInit(): void {
    this.user = this.localStorageService.getItem('userdata');
    this.selectQuery(this.queries[0]);
    this.refreshQueries.subscribe(data => {
      this.queryFilters = data;
    });
    if(this.queries.length > 0) {
      this.query.selectedQuery = this.queries[0];
      this.query.isQuerySelected = true;
    } else this.goBackToJobs.emit();
    console.log('queries gained ', this.queries);
    this.setupAmbiance();
  }

  setupAmbiance() {
  }

  getQueries() {
    const body = {
      jobId: this.job.job_id,
      filters: this.queryFilters
    };
    this.queriesService.getQueriesForJob(body).subscribe({
      next: (res: any) => {
        console.log('queries from api === ', res);
        this.queries = [...res.queries];
        this.selectQuery(this.queries[0]);
      },
      error: (err: any) => {
        console.log('error queries from api === ', err);
      }
    });
  }

  addNewQueryTab() {
    if(this.maxQueryLimit <= this.queries.length) return;
    else {
      this.queries.push(Query.defaultQuery(this.queries.length));
      this.selectedNewQuery = this.queries[this.queries.length - 1];
    }
  }

  removeNewQueryTab(index: number) {  
    if (index !== -1) {
      // Remove the specific item from the array
      this.queries.splice(index, 1);
  
      // Set selectedQueries to the nearest object
      if (this.queries.length > 0) {
        this.selectedNewQuery = this.queries[this.queries.length - 1];
        if(this.queries.length == 1) this.selectedNewQuery.queryIndex = 0;
      } else {
        // If the array is empty, set selectedQueries to null
        this.selectedNewQuery = Query.defaultQuery();
      }
    }
  }

  selectQuery(query: any) {
    console.log("selected query = ", query);
    this.query.selectedQuery = query;
    this.querySelected.emit(query);
  }

  resetQuerySelected() {
    this.query.selectedQuery = Query.defaultQuery();
    this.query.isQuerySelected = false;
    this.queryUnSelected.emit();
  }

  setNewQueryAttachment(attachment: { title: string, link: string }) {
    const attachmentTitle = attachment.title? attachment.title : `Document ${this.selectedNewQuery.attachments.length + 1}`;
    const attachmentLink = attachment.link;
    if(attachmentLink) {
      this.selectedNewQuery.attachments.push({
        title: attachmentTitle, link: attachmentLink, user_id: this.user.staff_id
      });
      this.selectedNewQuery.show_attachment_input = false;
    }
  }

  removeNewQueryAttachment = (index: number) => this.selectedNewQuery.attachments.splice(index, 1);

  setCategory = () => { 

  }

}
