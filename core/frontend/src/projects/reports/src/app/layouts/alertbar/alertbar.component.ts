import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alertbar',
  templateUrl: './alertbar.component.html',
  styleUrls: ['./alertbar.component.scss']
})
export class AlertbarComponent implements OnInit {

  @Input() showAlert: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
