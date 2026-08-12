import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'pq-toggle-switch',
  templateUrl: './toggle-switch.component.html',
  styleUrls: ['./toggle-switch.component.scss']
})
export class ToggleSwitchComponent implements OnInit {

  @Output() isChecked: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  @Input() containerClass: string = '';
  @Input() switchClass: string = '';
  @Input() toggleButtonClass: string = '';
  @Input() checked: boolean = false;
  @Input() toggleStyle: "primary" | "default" = "default";
  @Input() hideToggleText: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.containerClass = `${this.containerClass} toggle-${this.toggleStyle}`;
    this.toggleButtonClass = `${this.toggleButtonClass} toggle-button-${this.toggleStyle} ${(this.hideToggleText)? 'hide-toggle-text' : ''}`;
  }

  emitIsChecked() {
    this.isChecked.emit(this.checked);
  }
}
