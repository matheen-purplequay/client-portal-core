import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-network-loader',
  templateUrl: './network-loader.component.html',
  styleUrls: ['./network-loader.component.scss']
})
export class NetworkLoaderComponent implements OnInit {

  @Input() label: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
