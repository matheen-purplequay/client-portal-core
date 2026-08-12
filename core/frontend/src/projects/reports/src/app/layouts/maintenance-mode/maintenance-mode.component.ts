import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-maintenance-mode',
  templateUrl: './maintenance-mode.component.html',
  styleUrls: ['./maintenance-mode.component.scss']
})
export class MaintenanceModeComponent implements OnInit {

  @Output() refresh: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  emitRefresh() {
    this.refresh.emit();
  }

}
