import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface SimpleTab {
  index: number;
  label: string;
  data?: any;
  hide?: boolean;
  withDivider?: boolean;
}

@Component({
  selector: 'pq-simple-tab',
  templateUrl: './simple-tab.component.html',
  styleUrls: ['./simple-tab.component.scss']
})
export class SimpleTabComponent implements OnInit {

  @Output() tabSelectedEvent: EventEmitter<SimpleTab> = new EventEmitter();
  @Input() tabName = 'simple-tab';
  @Input() tabStyle: "default" | "minimal" | "island" | "form" = "default";
  @Input() tabs: SimpleTab[]  = [
    {
      index: 0,
      label: 'Tab 1'
    },
    {
      index: 1,
      label: 'Tab 2'
    }
  ];
  @Input() selectedTab = 0;
  @Input() containerClass: string = '';
  @Input() labelClass: string = '';
  @Input() labelContentClass: string = '';

  tabClasses = {
    default: ['default-tab'],
    minimal: ['minimal-tab'],
    island: ['island-tab'],
    form: ['form-control-tab']
  };

  constructor() { }

  ngOnInit(): void {
    this.containerClass = `${this.tabClasses[this.tabStyle]} ${this.containerClass}`;
  }

  emitTabSelected(tab: SimpleTab) {
    this.selectedTab = tab.index;
    this.tabSelectedEvent.emit(tab);
  }

}
