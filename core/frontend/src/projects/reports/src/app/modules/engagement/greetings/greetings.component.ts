import { Component, OnInit } from '@angular/core';
import { config } from 'projects/reports/src/environments/config';

@Component({
  selector: 'app-greetings',
  templateUrl: './greetings.component.html',
  styleUrls: ['./greetings.component.scss']
})
export class GreetingsComponent implements OnInit {

  config = config;
  snowFlakesCount: number[] = Array.from({ length: 10 }, (_, i) => i + 1);

  constructor() { }

  ngOnInit(): void {
  }

}
