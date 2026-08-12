import { Component, EventEmitter, Input, OnInit, Output, AfterContentInit, SimpleChanges, OnChanges, AfterViewChecked } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Error, ErrorTypes } from '../../models/error';

@Component({
  selector: 'pq-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit, AfterContentInit, OnChanges, AfterViewChecked {

  @Output() outputKey: EventEmitter<string> = new EventEmitter();
  @Output() outputValue: EventEmitter<string> = new EventEmitter();
  @Output() outputObject: EventEmitter<any> = new EventEmitter();
  @Output() outputObjects: EventEmitter<any> = new EventEmitter();

  @Input() revalidate: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() required: boolean = false;

  @Input() options: any | undefined;
  @Input() text: string | number = '';
  @Input() setOptionAsText: boolean = false;
  @Input() dropDownClass = '';
  @Input() dropDownButtonClass = '';
  @Input() dropDownStyle: "default" | "button" | "textbox" | "link" = "default";
  @Input() dropDownSize: "default" | "full" = "default";
  @Input() label = '';
  @Input() helper = '';
  @Input() helperClass: string = '';
  @Input() labelClass: string = '';
  @Input() selectedOption: string = '';
  @Input() selectedOptions: any[];
  @Input() dropDownType: "simple" | "advanced" = "simple";
  @Input() selectType: "single" | "multiple" = "single";
  @Input() keys: { key: string, value: string, description?: string } = { key: '', value: '', description: '' };
  @Input() menuWidth?: "small" | "default" | "large" = "default";
  @Input() showSearch: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() hideError = false;

  isErrorShown: boolean = false;
  error: Error | undefined = undefined;

  _menuWidthClasses = {
    small: ['dropdown-menu-sm'],
    default: ['dropdown-menu'],
    large: ['dropdown-menu-lg']
  };

  originalOptions: any[] = [];
  optionsCount: number = 0;

  searchTerm = '';

  _dropDownClass = ['dropdown-container'];
  _dropDownClasses = {
    default: ['defaut-dropdown'],
    button: ['button-dropdown'],
    textbox: ['textbox-dropdown'],
    link: ['link-dropdown']
  };
  _dropDownButtonClassess = ['dropdown-button'];
  _dropDownSizeClasses = {
    default: [''],
    full: ['dropdown-full-width']
  };
  _dropDownHelperClass: string[] = ['dropdown-helper', 'small'];

  constructor() {
    this.selectedOptions = [];
    this.options = [];
  }

  ngOnInit(): void {
    this.dropDownClass = `${this._dropDownClass} ${this._dropDownClasses[this.dropDownStyle].join(' ')} ${this._dropDownSizeClasses[this.dropDownSize].join(' ')} ${this.selectType} ${this.dropDownType} ${this.dropDownClass}`;
    this.dropDownButtonClass = `
      ${this._dropDownButtonClassess} 
      ${this.dropDownButtonClass} 
      ${ (this.dropDownStyle == 'default')? 'w-100 bg-white border shadow-sm' : '' } 
      ${ (this.dropDownStyle == 'button')? 'w-100 bg-white border shadow-sm' : '' } 
      ${ (this.dropDownStyle == 'link')? 'p-0 fw-semibold lh-1 rounded-0' : '' }
    `;
    this.helperClass = `${this._dropDownHelperClass.join(' ')} ${this.helperClass}`;
    this.labelClass = `${(this.dropDownStyle == 'link'? 'lh-1' : '')} ${this.labelClass}`;
    this.revalidate.subscribe(revalidate => {
      if (revalidate) this.validateDropDown();
    });
  }

  ngAfterContentInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.options.length > 0) this.originalOptions = [...this.options];
  }

  ngAfterViewChecked() {
  }

  validateDropDown(): boolean {
    let isValid = true;
    if (this.selectType == 'single' && this.selectedOption == '') isValid = false;
    if (this.selectType == 'multiple' && this.selectedOptions.length <= 0) isValid = false;
    
    if (isValid == false) this.setError(`${this.label} is required`, ``, ErrorTypes.error);
    else this.resetError();
    return isValid;
  }

  setError(title: string, message: string, type: ErrorTypes) {
    this.isErrorShown = true;
    this.error = new Error(title, message, type);
  }

  resetError() {
    this.isErrorShown = false;
    this.error = undefined;
  }

  emitValue(key: any, value: any) {
    this.selectedOption = key;
    this.outputKey.emit(key);
    this.outputValue.emit(value);
    this.options = this.originalOptions;
    this.validateDropDown();
  }

  emitOption(option: any, index: number) {
    this.selectedOption = option[this.keys['value']];
    this.outputObject.emit(option);
    this.options = this.originalOptions;
    this.validateDropDown();
  }

  emitOptions(option: any, event: MouseEvent) {
    event.stopPropagation();
    let doesExist = false;
    if(this.dropDownType == 'simple') {
      this.selectedOptions.filter((item: any) => {
        if (option == item) doesExist = true;
      });
      if (!doesExist) {
        this.selectedOptions.push(option);
        this.outputObjects.emit(this.selectedOptions);
      } else {
        this.selectedOptions = this.selectedOptions.filter((item: any) => {
          return item[this.keys['key']] != option[this.keys['key']]
        });
      }
    } else if(this.dropDownType == 'advanced') {
      this.selectedOptions.filter((item: any) => {
        if (option[this.keys['key']] == item[this.keys['key']]) doesExist = true;
      });
      if (!doesExist) {
        this.selectedOptions.push(option);
        this.outputObjects.emit(this.selectedOptions);
      } else {
        this.selectedOptions = this.selectedOptions.filter((item: any) => {
          return item[this.keys['key']] != option[this.keys['key']]
        });
      }
    }

    this.optionsCount = this.selectedOptions.length;
    this.validateDropDown();
  }

  removeSelectedOption(option: any) {
    if(this.selectType == 'single')
      this.selectedOptions = this.selectedOptions.filter((item: any) => {
        return option != item
      });
    else if(this.selectType == 'multiple')
      this.selectedOptions = this.selectedOptions.filter((item: any) => {
        return option[this.keys['key']] != item[this.keys['key']]
      });
  }

  isOptionSelected(option: any, key: string = ''): boolean {
    let flag = false;
    if(this.dropDownType == 'simple')
      flag = this.selectedOptions.some(selectedOption => selectedOption === option);
    else (this.dropDownType == 'advanced')
      flag = this.selectedOptions.some(selectedOption => selectedOption[this.keys['key']] === option);
    
    return flag;
  }

  isAnySelected(): boolean {
    if (this.dropDownType == 'simple') return (this.selectedOption) ? true : false;
    else return (this.selectedOptions.length > 0) ? true : false;
  }

  searchFocus(event: MouseEvent) {
    event.stopPropagation();
  }

  resetSearch() {
    this.searchTerm = '';
    this.options = this.originalOptions;
  }

  search(event: any) {
    if (this.searchTerm != '') {
      this.options = this.originalOptions;
      if (this.dropDownType == 'advanced') {
        this.options = this.options.filter((item: any) => {
          return (item[this.keys['value']] as string).toLowerCase().includes(this.searchTerm.toLowerCase())
        });
      } else if (this.dropDownType == 'simple') {
        this.options = this.options.filter((item: any) => {
          return item.toLowerCase().includes(this.searchTerm.toLowerCase())
        });
      }
    }
    else
      this.options = this.originalOptions;
  }

  getOptionValue(key: string) {
    let value = '';
    if (this.options instanceof Array) {
      const matchingOption = this.options.find(option => (option[this.keys.key] as String) === key);
      if (matchingOption) {
        value = matchingOption[this.keys.value];
      }
    }
    return value;
  }

  returnZero = () => { return 0; }

}
