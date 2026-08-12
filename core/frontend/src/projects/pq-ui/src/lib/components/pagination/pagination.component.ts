import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';

@Component({
  selector: 'pq-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

  @Output() pageChanged: EventEmitter<number> = new EventEmitter();

  @Input() config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1
  };

  constructor() { }

  ngOnInit(): void {
  }

  emitPageChanged(event: any) {
    this.config.currentPage = event;
    this.pageChanged.emit(event);
  }

}
