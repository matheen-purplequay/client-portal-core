import { Component, Input, OnInit } from '@angular/core';
import { MAX_ATTACHMENT_LIMIT, Query } from '../models/queries';
import { LocalStorageService } from 'projects/reports/src/app/services/app/storage/local-storage.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-admin-queries',
  templateUrl: './admin-queries.component.html',
  styleUrls: ['./admin-queries.component.scss']
})
export class AdminQueriesComponent implements OnInit {
  
  @Input() queries: Query[] = [];

  maxAttachments = MAX_ATTACHMENT_LIMIT;
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

  query: {isQuerySelected: boolean, selectedQuery: Query } = {
    isQuerySelected: false,
    selectedQuery: Query.defaultQuery()
  };
  doesReplyQueryRequiresResponse: boolean = false;

  user: any;
  approverRole = 'approver';


  constructor(
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.user = this.localStorageService.getItem('userdata');
    console.log('queries from admin queries === ', this.queries);
  }

  setupAmbiance() {
    
  }

  setSelectedQuery(query: Query) {
    this.query.selectedQuery = query;
    this.query.isQuerySelected = true;
  }

  deselectQuery() {
    this.query.selectedQuery = Query.defaultQuery();
    this.query.isQuerySelected = false;
  }

  setNewQueryAttachment(attachment: { title: string, link: string }) {
    const attachmentTitle = attachment.title? attachment.title : `Document ${this.query.selectedQuery.attachments.length + 1}`;
    const attachmentLink = attachment.link;
    if(attachmentLink) {
      this.query.selectedQuery.attachments.push({
        title: attachmentTitle, link: attachmentLink, user_id: this.user.staff_id
      });
      this.query.selectedQuery.show_attachment_input = false;
    }
  }

  removeQueryAttachment = (index: number) => this.query.selectedQuery.attachments.splice(index, 1);
}
