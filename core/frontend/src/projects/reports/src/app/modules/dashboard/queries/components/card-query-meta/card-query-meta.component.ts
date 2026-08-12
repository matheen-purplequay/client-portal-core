import { Component, Input, OnInit } from '@angular/core';
import { QueriesService } from 'projects/reports/src/app/services/dashboard/queries/queries.service';
import { Query } from '../../models/queries';

@Component({
  selector: 'app-card-query-meta',
  templateUrl: './card-query-meta.component.html',
  styleUrls: ['./card-query-meta.component.scss']
})
export class CardQueryMetaComponent implements OnInit {

  @Input() query: Query = Query.defaultQuery();
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';

  constructor(
    private queriesService: QueriesService
  ) { }

  ngOnInit(): void {
    this.setupAmbiance();
  }

  setupAmbiance() {

  }
}
