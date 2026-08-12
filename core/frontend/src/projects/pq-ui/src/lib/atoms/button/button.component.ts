import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'pq-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

  @Output() clickEvent = new EventEmitter<any>();

  @Input() text = 'Button';
  @Input() buttonContainerClass = '';
  @Input() buttonClass = '';
  @Input() buttonContentClass = '';
  @Input() isLoading: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() buttonStyle: "default" | "primary" | "secondary" | "simple" | "light" | "dark" | "outline" | "outline_primary" | "outline_dark" | "link" | "link_light" | "link_dark" | "link_danger" = "default";
  @Input() buttonWidth: "default" | "half" | "full" = "default";
  @Input() buttonShape: "default" | "rectangle" | "rounded" = "default";
  @Input() type: "button" | "link" = "button";
  @Input() link : string | undefined = undefined;
  @Input() isExternal: boolean = false;
  @Input() hideContent: boolean = false;

  _buttonContainerClass = ['button-container'];
  _buttonClass = ['button', 'w-100'];

  _buttonStyleClasses = {
    default: ['button-primary'],
    primary: ['button-primary'],
    secondary: ['button-secondary'],
    simple: ['button-simple'],
    light: ['bg-color-light', 'text-dark'],
    dark: ['button-dark'],
    outline: ['button-outline-primary'],
    outline_primary: ['button-outline-primary'],
    outline_dark: ['button-outline-dark'],
    link: ['button-link'],
    link_light: ['button-link', 'text-light'],
    link_dark: ['button-link', 'text-dark'],
    link_danger: ['button-link', 'text-danger']
  };
  _buttonWidthClasses = {
    default: ['d-inline-block'],
    half: ['w-50'],
    full: ['w-100', 'flex-grow-1'],
  }
  _buttonShapeClasses = {
    default: [''],
    rectangle: ['rounded-0'],
    rounded: ['rounded-pill'],
  };

  constructor() {
  }

  ngOnInit(): void {
    this.buttonContainerClass = `${this._buttonContainerClass.join(' ')} ${this._buttonWidthClasses[this.buttonWidth].join(' ')} ${this.buttonContainerClass}`;
    this.buttonClass = `${this._buttonClass.join(' ')} ${this.buttonClass} ${this._buttonStyleClasses[this.buttonStyle].join(' ')} ${this._buttonShapeClasses[this.buttonShape].join(' ')}`;
  }

  emitClick() {
    this.clickEvent.emit();
  }

}
