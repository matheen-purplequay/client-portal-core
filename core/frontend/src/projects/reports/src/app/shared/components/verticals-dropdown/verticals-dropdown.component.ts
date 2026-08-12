import { Component, EventEmitter, OnInit, Output } from '@angular/core';

interface Vertical {
  index: number;
  name: string;
}

interface VerticalFilter {
  verticals: Vertical[];
  selectedVertical: Vertical
}

@Component({
  selector: 'app-verticals-dropdown',
  templateUrl: './verticals-dropdown.component.html',
  styleUrls: ['./verticals-dropdown.component.scss']
})
export class VerticalsDropdownComponent implements OnInit {

  @Output() verticalSelectedEvent: EventEmitter<Vertical> = new EventEmitter();
  @Output() selectedVerticalEvent: EventEmitter<Vertical> = new EventEmitter();
  

  verticalFilters: VerticalFilter = {
    verticals: [
      { index: 1, name: 'Business Services' },
      { index: 2, name: 'Super Fund' },
      { index: 4, name: 'Internal Account' },
      { index: 5, name: 'Financial Planning' },
      { index: 6, name: 'Mortgage' },
      { index: 7, name: 'Design and Marketing' },
      { index: 8, name: 'Technology Group' }
    ],
    selectedVertical: { index: 1, name: 'Business Services' }
  };

  constructor() { }

  ngOnInit(): void {
    this.verticalFilters.selectedVertical = this.verticalFilters.verticals[0];
    this.selectedVerticalEvent.emit(this.verticalFilters.selectedVertical);
  }

  emitVertical(vertical: Vertical) {
    this.verticalSelectedEvent.emit(vertical);
  }

}
