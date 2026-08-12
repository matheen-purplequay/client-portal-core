import { Component, Input, OnInit } from '@angular/core';
import { JobQueries, Query, QueryReply } from '../../models/queries';
import { QueriesService } from 'projects/pq-admin/src/app/services/inbox/queries.service';

@Component({
  selector: 'app-card-query-meta',
  templateUrl: './card-query-meta.component.html',
  styleUrls: ['./card-query-meta.component.scss']
})
export class CardQueryMetaComponent implements OnInit {

  @Input() job: JobQueries = JobQueries.defaultJobQuery();
  @Input() query: Query = Query.defaultQuery();
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @Input() isDraftQuery: boolean = false;

  constructor(
    private queriesService: QueriesService
  ) { }

  ngOnInit(): void {
    console.log('query received in card query meta component ', this.query);
    this.setupAmbiance();
  }

  setupAmbiance() {

  }
}
