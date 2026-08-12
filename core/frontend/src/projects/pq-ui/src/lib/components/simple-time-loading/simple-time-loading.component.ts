import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pq-simple-time-loading',
  templateUrl: './simple-time-loading.component.html',
  styleUrls: ['./simple-time-loading.component.scss']
})
export class SimpleTimeLoadingComponent implements OnInit {

  @Input() loadingText: string = 'Loading...';
  @Input() containerClass: string = '';
  @Input() loaderStyle: "default" | "primary" | "light" = "default";
  @Input() loaderClass: string = '';
  
  containerClasses: string[] = ['loader-container', 'p-5', 'text-center', 'vstack', 'gap-1', 'align-items-center', 'justify-content-center'];
  loaderClasses: string[] = ['loader'];
  loaderStyles = {
    default: ['loader-default'],
    primary: ['loader-primary', 'color-primary'],
    light: ['loader-light', 'color-light']
  };

  constructor() { }

  ngOnInit(): void {
    this.containerClass = `${this.containerClasses.join(' ')} ${this.loaderStyles[this.loaderStyle].join(' ')} ${this.containerClass}`;
    this.loaderClass = `${this.loaderClasses.join(' ')} ${this.loaderClass}`;
  }

}
