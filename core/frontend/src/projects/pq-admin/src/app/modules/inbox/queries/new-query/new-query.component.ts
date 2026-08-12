import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { CRITICALITIES, JobQueries, MAX_ATTACHMENT_LIMIT, MAX_QUERY_LIMIT, MasterFilter, MasterFilterKeys, MasterFiltersMeta, NewQuery, QUERYRESPONSETYPE, Query, QueryAttachment, QueryFilters, QueryTemplate, SUBCATEGORIES } from '../models/queries';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { SimpleTab } from 'pq-ui';
import { QueriesService } from 'projects/pq-admin/src/app/services/inbox/queries.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ClientsService } from 'projects/pq-admin/src/app/services/entities/clients.service';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';

interface ClientUser {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  email: string;
  wm_client_id: number;
  wm_user_id: number;
}

class ClientUser {
  static defaultClientUser() {
    return {
      id: 0,
      first_name: "",
      middle_name: "",
      last_name: "",
      full_name: '',
      email: "",
      wm_client_id: 0,
      wm_user_id: 0
    } as ClientUser;
  }
}

@Component({
  selector: 'app-new-query',
  templateUrl: './new-query.component.html',
  styleUrls: ['./new-query.component.scss']
})
export class NewQueryComponent implements OnInit {

  @Output() queriesPosted: EventEmitter<boolean> = new EventEmitter();
  @Output() dismissNewQuery: EventEmitter<boolean> = new EventEmitter();
  @Input() initialQueryTemplate: QueryTemplate = QueryTemplate.defaultQueryTemplate();
  @Input() job: JobQueries = JobQueries.defaultJobQuery();
  
  unsavedChanges = true;
  showDismissConfirmation: boolean = false;
  showNotReadyPopup: boolean = false;
  isMounted: boolean = false;
  isSendingQueries: boolean = false;

  queries: Query[] = [];
  currentQuery: { selectedNewQuery: Query, isQuerySelected: boolean, selectedQueryId: number, editActivity: "edit_options" | "none" } = {
    selectedNewQuery: Query.defaultQuery(),
    isQuerySelected: false,
    selectedQueryId: -1,
    editActivity: "none"
  };
  public Editor = ClassicEditor;
  maxAttachments = MAX_ATTACHMENT_LIMIT;
  maxQueryLimit = MAX_QUERY_LIMIT;
  
  public newQueryEditorConfig = {
    placeholder: "",
    toolbar: {
      items: [
        'undo', 'redo',
        '|', 'heading',
        '|', 'bold', 'italic',
        '|', 'link', 'insertTable', 'blockQuote',
        '|', 'bulletedList', 'numberedList', 'outdent', 'indent',
        '|', 'uploadImage'
      ]
    },
    languageDirection: 'ltr',
  }

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

  newQueryResponseType: { tabs: SimpleTab[], selectedTab: SimpleTab } = {
    tabs: QUERYRESPONSETYPE,
    selectedTab: QUERYRESPONSETYPE[0]
  };

  queriesChecked: boolean = false;
  newQueryViews = {
    table: { index: 0, label: 'Simple' },
    card: { index: 1, label: 'Informative' },
    // form: { index: 2, label: 'Focused' },
  };
  newQueryView = {
    list: Object.values(this.newQueryViews),
    selectedView: this.newQueryViews.table
  };

  templatesList = {
    confirmation: { index: 0, label: 'Request for a confirmation', code: 'confirmation' },
    clartification: { index: 1, label: 'Request for a clarification', code: 'clarification' },
    document: { index: 2, label: 'Requesting a document', code: 'document' }
  };

  templates: { list: {index: number, label: string}[], selected: {index: number, label: string}, keys: { key: string, value: string } } = {
    list: Object.values(this.templatesList),
    selected: this.templatesList.confirmation, 
    keys: { key: 'index', value: 'label' }
  };

  @Input() queryFilters: QueryFilters = QueryFilters.defaultQueryFilters();
  @Input() masterFilters: MasterFiltersMeta = MasterFiltersMeta.defaultMasterFiltersMeta();

  newQuery: NewQuery = NewQuery.defaultNewQuery();

  user: any;
  clientUsers: { list: ClientUser[], selectedUser: ClientUser, keys: { key: string, value: string }, isGettingUsers: boolean } = {
    list: [],
    selectedUser: ClientUser.defaultClientUser(),
    keys: { key: 'wm_client_id', value: 'full_name' },
    isGettingUsers: false
  }

  stepperActivityList = {
    queryOptions: { index: 0, label: 'Query Options' },
    responseOptions: { index: 1, label: 'Response Options' },
  };

  stepperActivity = {
    list: Object.values(this.stepperActivityList),
    selected: this.stepperActivityList.queryOptions
  };

  queryDescription: string = ''; // Textarea input
  detectedDocuments: string[] = []; // Stores detected document titles

  alertMessage: { type: "success" | "error", message: string, show: boolean, dismissable?: boolean, duration?: number } = {
    type: "success", message: "", show: false, duration: 5000, dismissable: true
  };

  existingQueries: {query_code: string, title: string, query: string, posted_date: string}[] = [];

  constructor(
    private storageService: StorageService,
    private queriesService: QueriesService,
    private clientsService: ClientsService
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getItem('userdata');
    console.log('initial query template ', this.initialQueryTemplate);
    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getClientUsersByProject();
    this.isMounted = true;
    this.addMoreQueries(this.initialQueryTemplate);
    // this.currentQuery.selectedNewQuery = this.queries[0];
  }

  getFilters(id: number, index: number) {
    this.queriesService.getMasterFilter(id).subscribe({
      next: (res: any) => {
        if(res.status) {
          this.masterFilters.sub_category.list = res.masters.data;
          this.masterFilters.sub_category.selected.value = this.masterFilters.sub_category.list[0].id;
          this.queries[index].sub_category_id = this.masterFilters.sub_category.list[0].id;
          this.queries[index].sub_category_name = this.masterFilters.sub_category.list[0].master_name;
        }
      },
      error: (err: any) => {}
    });
  }

  setupFilters() {
    this.masterFilters.category.selected = {
      code: 'category',
      value: this.initialQueryTemplate.category_id,
      name: this.initialQueryTemplate.category_name
    };
    this.masterFilters.sub_category.selected = {
      code: 'sub_category',
      value: this.initialQueryTemplate.sub_category_id,
      name: this.initialQueryTemplate.sub_category_name
    };
    this.masterFilters.criticality.selected = {
      code: 'criticality',
      value: this.initialQueryTemplate.criticality_id,
      name: this.initialQueryTemplate.criticality_name
    };
    this.masterFilters.response_type.selected = {
      code: 'response_type',
      value: this.initialQueryTemplate.response_type_id,
      name: this.initialQueryTemplate.response_type
    };
    console.log("master filters in new query ", this.masterFilters);
    
    this.setQueriesDefault(0, this.initialQueryTemplate);
  }

  getClientUsersByProject() {
    this.clientUsers.isGettingUsers = true;
    const body = {
      project_id: this.job.client_id
    }
    this.clientsService.getClientUsersByProjectId(body).subscribe({
      next: (res: any) => {
        this.clientUsers.list = [];
        if(res.status) {
          this.clientUsers.list = res.data;
          this.setupFilters();
          this.clientUsers.isGettingUsers = false;
        }
      },
      error: (err: any) => {
        this.clientUsers.isGettingUsers = false;
      }
    });
  }

  getFilterValue(filters: MasterFilter[], id: number): string {
    try {
      return filters.filter(item => item.id === id)[0].master_name;
    } catch(e) {
      return "";
    }
  }

  setTemplate(index: number, template: { index: number, label: string, code: string }) {
    let selectedResponseTypeTab: any;
    console.log('set template ', index, template);
    switch(template.index) {
      case this.templatesList.confirmation.index:
        selectedResponseTypeTab = this.newQueryResponseType.tabs.filter(tab => tab.data.code == this.templatesList.confirmation.code)[0];
        this.queries[index].response_type = this.templatesList.confirmation.code;
        this.queries[index].response_type_id = selectedResponseTypeTab.index;
        break;
      case this.templatesList.clartification.index:
        selectedResponseTypeTab = this.newQueryResponseType.tabs.filter(tab => tab.data.code == this.templatesList.clartification.code)[0];
        this.queries[index].response_type = this.templatesList.clartification.code;
        this.queries[index].response_type_id = selectedResponseTypeTab.index;
        break;
      case this.templatesList.document.index:
        selectedResponseTypeTab = this.newQueryResponseType.tabs.filter(tab => tab.data.code == this.templatesList.document.code)[0];
        this.queries[index].response_type = this.templatesList.document.code;
        this.queries[index].response_type_id = selectedResponseTypeTab.index;
        break;
    }
  }

  dismissAndGoBack() {
    this.showDismissConfirmation = true;
  }
  
  dismiss() {
    this.dismissNewQuery.emit();
  }

  setQueryTemplate(queryTemplate: QueryTemplate) {
    let query = this.currentQuery.selectedNewQuery;
    query = {...query, ...queryTemplate};
    this.queries[this.currentQuery.selectedQueryId] = query;
  }

  addMoreQueries(queryTemplate = QueryTemplate.defaultQueryTemplate()) {
    console.log('add more querys ', this.queries.length, this.maxQueryLimit);
    if(this.maxQueryLimit <= this.queries.length) {
      return;
    }
    else {
      let fromScratch = (this.queries.length <= 0);
      console.log('from scratch == ', fromScratch);
      let newQuery = Query.defaultQuery(this.queries.length);
      
      if(fromScratch) newQuery = {...newQuery, ...queryTemplate};
      else newQuery = { ...newQuery, ...queryTemplate};      
      
      newQuery.job_touchpoint       = this.job.job_touchpoint;
      newQuery.category_id          = queryTemplate.category_id;
      newQuery.category_name        = queryTemplate.category_name;
      newQuery.sub_category_id      = queryTemplate.sub_category_id;
      newQuery.sub_category_name    = queryTemplate.sub_category_name;
      newQuery.criticality_id       = queryTemplate.criticality_id;
      newQuery.criticality_name     = queryTemplate.criticality_name;
      newQuery.response_type        = queryTemplate.response_type;
      newQuery.query_template_code  = queryTemplate.query_template_code;
      newQuery.client_id            = this.job.client_id;
      
      this.queries.push(newQuery);
      this.checkIfQueryExists(this.queries.indexOf(newQuery), queryTemplate.title, this.job.job_id, queryTemplate.query, this.job.client_id);
      
      this.setQueriesDefault(this.queries.length - 1, queryTemplate);
      this.currentQuery.selectedNewQuery = this.queries[this.queries.length - 1];      

    }
  }

  checkIfQueryExists(newQueryIndex: number, title: string, job_id: number, query: string, client_id: number) {
    console.log('check if query exists ', newQueryIndex, title, job_id, query, client_id);
    const body = {
      title: title,
      job_id: job_id,
      query: query,
      client_id: client_id
    }
    this.queries[newQueryIndex].isCheckingQueryExists = true;
    this.queriesService.checkIfQueryExists(body).subscribe({
      next: (res: any) => {
        if(!res.status) {
          this.existingQueries = res.queries;
          if(this.existingQueries.length > 0) {
            this.queries[newQueryIndex].isQueryExists = this.existingQueries.length > 0;
            this.queries[newQueryIndex].existingQueries = this.existingQueries;
          } else {
            this.queries[newQueryIndex].isQueryExists = false;
            this.queries[newQueryIndex].existingQueries = [];
          }
        } else {
            this.queries[newQueryIndex].isQueryExists = false;
            this.queries[newQueryIndex].existingQueries = [];
        }
        this.queries[newQueryIndex].isCheckingQueryExists = false;
      },
      error: (err) => {
        this.queries[newQueryIndex].isCheckingQueryExists = false;
        console.error('Error checking query existence:', err);
      }
    });
  }

  removeNewQuery(index: number) {
    if(confirm(`Are you sure you want to remove the query ${this.queries[index].title ?? 'Query index + 1' }?`)) {
      if (index !== -1) {
        // Remove the specific item from the array
        this.queries.splice(index, 1);
    
        // Set selectedQueries to the nearest object
        if (this.queries.length > 0) {
          this.currentQuery.selectedNewQuery = this.queries[this.queries.length - 1];
          if(this.queries.length == 1) this.currentQuery.selectedNewQuery.queryIndex = 0;
        } else {
          // If the array is empty, set selectedQueries to null
          this.currentQuery.selectedNewQuery = Query.defaultQuery();
          // this.queries.push(Query.defaultQuery());
          // this.setQueriesDefault(0);
        }
      }
    }
  }

  setQueriesDefault(index: number, template: QueryTemplate) {
    if(this.queries.length <= 0) {
      this.addMoreQueries();
      index = 0;
    }

    this.queries[index].category_id           = template.category_id;
    this.queries[index].category_name         = template.category_name;
    this.queries[index].sub_category_id       = template.sub_category_id;
    this.queries[index].sub_category_name     = template.sub_category_name;
    this.queries[index].criticality_id        = template.criticality_id;
    this.queries[index].criticality_name      = template.criticality_name;
    this.queries[index].response_type         = template.response_type;
    this.queries[index].title                 = template.title;
    this.queries[index].query                 = template.query;
    this.queries[index].query_template_code   = template.query_template_code;

    this.queries[index].raised_to_id = this.clientUsers.list[0].wm_client_id;
    this.queries[index].raised_to_name = this.clientUsers.list[0].full_name;
    this.queries[index].raised_by_id = this.user.staff_id;
    this.queries[index].raised_by_name = `${this.user.first_name} ${this.user.last_name}`;
    this.queries[index].response_type_description = '';
    this.queries[index].job_id = this.job.job_id;
    this.queries[index].job_touchpoint = this.job.job_touchpoint;
    this.queries[index].client_id = this.job.client_id;

    this.getResponseDocumentsFromQuery(index);
  }

  setQueryEditActivity(index: number, query: Query, activity: "edit_options" | "none") {
    this.currentQuery.selectedQueryId = index;
    this.currentQuery.selectedNewQuery = query;
    this.currentQuery.isQuerySelected = true;
    this.currentQuery.editActivity = activity;
    console.log('currently selected query ', this.currentQuery);
  }

  setSelectedQueryDescription(index: number) {
    this.queries[index].query = this.currentQuery.selectedNewQuery.query;
  }

  resetSelectedQuery() {
    this.currentQuery.selectedNewQuery = Query.defaultQuery(); 
    this.currentQuery.selectedQueryId = -1; 
    this.currentQuery.isQuerySelected = false;
    this.currentQuery.editActivity = "none";
    this.stepperActivity.selected = this.stepperActivityList.queryOptions;
  }
  
  toggleQuerySelected(query?: any) {
    this.selectQuery(query);
  }

  selectQuery(query: any) {
    this.currentQuery.selectedNewQuery = query;
  }

  addAttachment(index: number, event: any) {
    this.queries[index].attachments.push({
      title: (event.title != '')? event.title : `Document ${Math.floor(1000 + Math.random() * 9000)}`,
      link: event.link,
      user_id: this.user.user_id
    });
    this.queries[index].show_attachment_input = false;
  }

  removeAttachment(index: number, attachment_index: number) {
    this.queries[index].attachments = this.queries[index].attachments.filter((attachment, index) => index !== attachment_index);
  }

  selectResponseType(index: number, event: any) {
    this.queries[index].response_type = event.data.code;
    this.queries[index].response_type_id = event.index;
    console.log('response type ', event, this.queries[index].response_type);
  }

  toNumber = (value: string) => parseInt(value);

  validateQuery() {
    let isReadyToSend: boolean = true;

    this.queries.forEach(query => {  
      query.job_touchpoint = this.job.job_touchpoint;
      query.job_touchpoint_id = this.toNumber(this.job.job_touchpoint.split('.')[0]);
      if(query.query == '') { isReadyToSend = false; return; }
      else { isReadyToSend = true; };
    });
    
    return isReadyToSend;
  }

  checkForPlaceholder() {
    let notReady: boolean = true;
    
    this.queries.forEach((query, index) => {
      const hasPlaceholder = /\[\[.*?\]\]/.test(query.query);  // Check for placeholders like [[amount]]
      const hasOpeningBracket = query.query.includes('[[');    // Check for [[ 
      const hasClosingBracket = query.query.includes(']]');    // Check for ]]

      if (hasPlaceholder) { notReady = true; }
      else if (hasOpeningBracket) { notReady = true; }
      else if (hasClosingBracket) { notReady = true; }
      else { notReady = false; }

      if(notReady) {
        this.currentQuery.selectedNewQuery = query;
        this.currentQuery.selectedQueryId = index;
        this.currentQuery.isQuerySelected = true;
        this.currentQuery.editActivity = 'edit_options';
        console.log('query placeholder ', query.query, hasPlaceholder, hasOpeningBracket, hasClosingBracket);
        return true;
      } else return false;

    });

    return notReady;
  }

  toggleAlertMessage(message: string, type: "success" | "error", show: boolean, dismissable?: boolean, duration?: number) {
    this.alertMessage = {message, type, show, dismissable, duration};
    if(show && dismissable) {
      setTimeout(() => {
        this.resetAlertMessage();
      }, duration);
    }
  }

  resetAlertMessage() {
    this.alertMessage.message = '';
    this.alertMessage.show = false;
    this.alertMessage.type = 'success';
    this.alertMessage.dismissable = true;
    this.alertMessage.duration = 5000;
  }

  sendQuery() {
    if(!this.validateQuery()) {
      this.showNotReadyPopup = true;
      this.toggleAlertMessage(
        'Please fill all fields to send query',
        'error',
        true
      );
      return;
    }
    else if(this.checkForPlaceholder()) {
      this.toggleAlertMessage(
        'Placeholders are present. Please update the query description and try again.',
        'error',
        true
      );
      return;
    } else {
      this.isSendingQueries = true;
      this.showNotReadyPopup = false;
      console.log('queries before sending ', this.queries);
      this.queriesService.addQuery(this.queries).subscribe({
        next: (res: any) => {
          this.isSendingQueries = false;
          if(res.status) this.queriesPosted.emit(true);
        },
        error: (err :any) => {
          this.isSendingQueries = false;
        }
      });
    }
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  addResponseAttachments(index: number, number_of_documents: number) {
    if(this.queries[index].response_attachments.length > 0 && !confirm('All document titles will be cleared. Are you sure?')) return;
    this.queries[index].response_attachments = [];
    for(let i = 0; i < number_of_documents; i++) {
      this.queries[index].response_attachments.push(QueryAttachment.addAttachmentTitle("", this.user.user_id));
    }
  }

  addResponseAttachment(index: number, title: string) {
    this.queries[index].response_attachments.push(QueryAttachment.addAttachmentTitle(title, this.user.user_id));
  }

  removeResponseAttachment(index: number, qaIndex: number) {
    this.queries[index].response_attachments.splice(qaIndex, 1);
  }

  // Fired whenever the content in CKEditor changes
  onEditorChange(event: any, index: number) {
    // Get the HTML content from CKEditor
    const htmlContent = event.editor.getData();

    // Extract plain text from HTML
    const plainText = this.stripHtmlTags(htmlContent);

    // Process the plain text to detect document titles
    this.detectDocuments(htmlContent, index);
  }

  getResponseDocumentsFromQuery(index: number) {
        // Get the HTML content from CKEditor
        const htmlContent = this.queries[index].query;

        // Extract plain text from HTML
        const plainText = this.stripHtmlTags(htmlContent);
    
        // Process the plain text to detect document titles
        this.detectDocuments(htmlContent, index);
  }

  // Utility to remove HTML tags and convert content to plain text
  stripHtmlTags(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  detectDocuments(text: string, index: number) {
    console.log('text in detect documents ', text, index);
    // Clear the detected documents list
    let detectedDocuments: string[] = [];

    // Detect if the text contains HTML (using <li> elements) or numbered items (1) or 1.)
    const containsHtmlList = /<li>/i.test(text); // Check if there's an HTML list (<li>)
    const containsNumberedList = /\d+\)|\d+\./i.test(text); // Check for numbered list pattern like 1) or 1.

    // Convert the query to lowercase for consistent keyword matching
    const description = text.toLowerCase();

    // Keywords that indicate a document request
    const documentRequestKeywords = [
      'documents',
      'workpapers',
      'file',
      'provide the following documents',
    ];

    // Check if the query includes document-related keywords
    const isRequestingDocuments = documentRequestKeywords.some(keyword =>
      description.includes(keyword)
    );

    if (!isRequestingDocuments) {
      return; // Exit if it's not a document request
    }

    // Regex to extract bullet points or numbered list items
    const documentRegex = /(?:-|\*|\d+\))\s*(.+)/g;
    let match;
    let titles: any[] = [];
    let documentTitle = '';

    if(containsHtmlList) {
      console.log('contains html list');
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const listItems = doc.querySelectorAll('li');
      detectedDocuments = Array.from(listItems).map(li => li.textContent?.trim() || '');
    } else if(containsNumberedList) {
      console.log('contains number list');
      
      // Extract document titles from the description
      // while ((match = documentRegex.exec(description)) !== null) {
      //   documentTitle = match[1].trim(); // Clean up extracted text
      // }
      // detectedDocuments = documentTitle.split(/\d+\)/).map(item => item.trim()).filter(item => item.length > 0);
      // Regex to extract numbered list items like 1) or 1.
      const documentRegex = /(?:\d+\)|\d+\.)\s*(.+)/g;
      let match;
      while ((match = documentRegex.exec(text)) !== null) {
        let documentTitle = match[1].trim();
        detectedDocuments.push(documentTitle);
      }
    }

    

    if(detectedDocuments.length > 0) {
      this.queries[index].response_attachments = [];
      detectedDocuments.forEach((document: string) => {
        // Remove any stray HTML tags (e.g., "<p>")
        document = document.replace(/<[^>]+>/g, '');

        // Remove numbering at the beginning (e.g., "1)", "2)", etc.)
        document = document.trim().replace(/^\d+\)\s*/, '');  // This regex will match numbers with parenthesis at the start

        console.log('document title == ', document);

        this.queries[index].response_attachments.push({
          title: this.toTitleCase(document),
          user_id: this.user.user_id,
          link: ''
        });
      });
      console.log('response documents ', detectedDocuments, this.queries[index].response_attachments);
    }

    return detectedDocuments;
  }

  toTitleCase(str: string): string {
    const smallWords = ['and', 'or', 'the', 'in', 'on', 'for', 'to', 'a', 'an'];
    
    return str
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !smallWords.includes(word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
      })
      .join(' ');
  }
}
