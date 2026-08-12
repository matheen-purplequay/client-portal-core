import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-simple-loading-text',
  templateUrl: './simple-loading-text.component.html',
  styleUrls: ['./simple-loading-text.component.scss']
})
export class SimpleLoadingTextComponent implements OnInit {

  @Input() loadingStyle: "default" | "simple" | "simple_light" | "simple_primary" | "primary" | "light" | "dark" = 'default';
  loadingStyles: { [key: string]: string[] } = {
    default: ['bg-light', 'shadow-sm', 'rounded'],
    simple: ['bg-transparent'],
    simple_light: ['bg-transparent', 'text-light'],
    simple_primary: ['bg-transparent', 'color-primary'],
    primary: ['bg-color-primary', 'text-light', 'shadow-sm', 'rounded'],
    light: ['bg-light', 'text-dark', 'rounded'],
    dark: ['bg-dark', 'text-light', 'shadow-sm', 'rounded'],
  };
  @Input() containerClass: string = '';

  constructor() { }

  ngOnInit(): void {
    this.containerClass = `${this.loadingStyles[this.loadingStyle].join(' ')} ${this.containerClass}`;
  }

}
