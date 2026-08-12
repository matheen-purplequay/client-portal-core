import { Component, Input, OnInit } from '@angular/core';
import { Error as ERR, ErrorTypes } from '../../models/error';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'pq-inline-alert',
  templateUrl: './inline-alert.component.html',
  styleUrls: ['./inline-alert.component.scss']
})
export class InlineAlertComponent implements OnInit {
  componentId: string = '';
  @Input() index: number = 0;
  @Input() error: ERR | undefined;
  @Input() alertClass: string = '';
  _alertClass = ['accordion', 'inline-alert'];
  _errorClass: {
    text: string;
    background: string;
  } | undefined;

  constructor() {
    this.componentId = uuidv4();
  }
  
  ngOnInit(): void {
    if (!this.error) {
      this.error = new ERR('', '', ErrorTypes.error);
    }
    this.alertClass = `${this._alertClass.join(' ')} ${this.alertClass}`;

  }

}
