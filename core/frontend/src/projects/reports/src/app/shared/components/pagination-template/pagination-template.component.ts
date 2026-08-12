import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';

@Component({
  selector: 'app-pagination-template',
  templateUrl: './pagination-template.component.html',
  styleUrls: ['./pagination-template.component.scss']
})
export class PaginationTemplateComponent implements OnInit {

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
