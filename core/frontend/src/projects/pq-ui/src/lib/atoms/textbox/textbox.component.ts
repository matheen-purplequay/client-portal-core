import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subject } from 'rxjs';
import { Error, ErrorTypes } from '../../models/error';
import { v4 as uuidv4 } from 'uuid';

/* 
* TEXTBOX COMPONENT
* Available Attributes
* 1. containerClass
* 2. label
* 3. labelClass
* 4. type
* 5. placeholder 
* 6. textBoxClass 
* 7. customError
* 8. errorClass
* 9. helper
* 10. helperClass
*/

@Component({
  selector: 'pq-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss']
})

export class TextboxComponent implements OnInit {
  componentId: string;
  @Output() outputValue = new EventEmitter<string>();
  @Output() outputEvent = new EventEmitter<InputEvent>();
  @Output() outputDate = new EventEmitter<Date>();
  @Output() outputFile = new EventEmitter<File>();
  @Output() outputOnFocusChange = new EventEmitter<string>();
  @Output() isValid = new EventEmitter<boolean>(false);
  @Input() revalidate: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // Defining textbox type
  types = {
    'text': { code: 'text', type: 'text' },
    'password': { code: 'password', type: 'passowrd' },
    'name': { code: 'name', type: 'text' },
    'email': { code: 'email', type: 'email' },
    'phone': { code: 'phone', type: 'phone' },
    'number': { code: 'number', type: 'number' },
    'dob': { code: 'dob', type: 'date' },
    'file': { code: 'file', type: 'file' }
  }

  // These variables must be combined with respective @Input() variables on ngOnInit()
  _textBoxLabelClass: string[] = ['textbox-label']
  _textBoxClass: string[] = ['textbox', 'focus-border-primary'];
  _textBoxHelperClass: string[] = ['textbox-helper', 'small'];
  _textBoxErrorClass: string[] = ['textbox-error', 'small', 'color-danger'];
  _textBoxContainerClass: string[] = ['textbox-container'];
  _floatingLabelClasses = { floatingClass: 'floating-label', fixedClass: 'fixed-label' };
  _requiredErrorClass: string = "field-required";

  // Attribute variables of component
  @Input() textBoxStyle: 'default' | 'minimal' | '' = 'default';
  @Input() containerClass: string = '';
  @Input() label: string = '';
  @Input() labelClass: string = '';
  @Input() type: string = '';
  @Input() placeholder: string = '';
  @Input() textBoxClass: string = '';
  @Input() errors: Error[] = [];
  @Input() errorType: ErrorTypes = ErrorTypes.error;
  @Input() errorsClass: string = '';
  @Input() helper: string = '';
  @Input() helperClass: string = '';
  @Input() floatingLabel: string = 'false';
  @Input() required: boolean = false;
  @Input() autocomplete: boolean = true;
  @Input() readonly: boolean = false;
  @Input() validate: string = "false";
  @Input() showAsTextArea: boolean = false;
  @Input() dateSelectionType: "single" | "range" = "single";
  @Input() hideError: boolean = false;
  @Input() maxLength: number = 0;
  @Input() minLength: number = 0;
  @Input() spellCheck: boolean = false;
  @Output() textBoxContentChange = new EventEmitter<string>();

  // Declaring state variables
  @Input() textBoxContent: any = '';
  isContentExists: boolean = false;
  isErrorShown: boolean = false;

  // Date Range Variables
  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate | null;
  toDate: NgbDate | null;

  @Input() dateContent: NgbDateStruct = { year: (new Date().getFullYear()), month: (new Date().getMonth() + 1), day: (new Date().getDate()) };

  constructor(
    private calendar: NgbCalendar, public formatter: NgbDateParserFormatter
  ) {
    this.componentId = uuidv4();
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit(): void {
    // Combining default classes with @Input() class variables
    this.containerClass = `${this._textBoxContainerClass.join(' ')} ${this.containerClass}`;
    this.labelClass = `${this._textBoxLabelClass.join(' ')} ${this.labelClass}`;
    this.textBoxClass = `${this._textBoxClass.join(' ')} ${this.textBoxClass}`;
    this.errorsClass = `${this._textBoxErrorClass.join(' ')} ${this.errorsClass}`;
    this.helperClass = `${this._textBoxHelperClass.join(' ')} ${this.helperClass}`;
    if (!this.textBoxStyle) this.textBoxStyle = 'default';

    this.checkAndSetIsContentExists();

    this.revalidate.subscribe(revalidate => {
      if (revalidate) this.validateTextBox();
    });
  }

  checkAndSetIsContentExists = () => {
    if (this.type == 'date')
      this.isContentExists = (this.dateContent != null);
    else
      this.isContentExists = (this.textBoxContent != '');
    return this.isContentExists;
  }

  // Method to set content state for textbox
  setContentState(event: string = 'change') {
    this.checkAndSetIsContentExists();

    // Always emit the latest content (even empty string)
    if (this.type == 'date') {
      this.outputDate.emit(
        new Date(this.dateContent.year, this.dateContent.month, this.dateContent.day)
      );
    } else if (this.type == 'file') {
      this.outputFile.emit(this.textBoxContent);
    } else {
      if (event == 'change') this.outputValue.emit(this.textBoxContent);
      if (event == 'blur') this.outputOnFocusChange.emit(this.textBoxContent);
    }

    this.validateTextBox();
  }


  // Method to set floating label state for textbox label
  setFloatingLabelState() {
    let floating_class = this._floatingLabelClasses.floatingClass;
    let fixed_class = this._floatingLabelClasses.fixedClass;

    if (this.isContentExists)
      this.labelClass = `${this._textBoxLabelClass.join(' ')} ${this.labelClass} ${floating_class} ${fixed_class}`;
    else
      this.labelClass = `${this._textBoxLabelClass.join(' ')} ${this.labelClass} ${floating_class}`;
  }

  // Date Range Functions

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  onKeyup(event: KeyboardEvent) {
    const key = event.keyCode || event.charCode;
    if (key === 13) {               // enter (cr)
      this.setContentState();
    } else if (
      key === 8 || key === 46 ||    // backspace or delete
      (key === 8 && 17) ||          // backspace + ctrl
      (key === 8 && 16) ||          // backspace + shift
      (key === 46 && 17)            // delete + ctrl
    ) {
      this.setContentState();
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  // Method to call validations based on textbox content type
  validateTextBox() {
    this.resetErrors();

    if (this.required)
      this.validateRequired();

    if (!this.isErrorShown) {

      switch (this.type) {
        case this.types.name.code:
          this.validateName();
          break;
        case this.types.phone.code:
          this.validatePhone();
          break;
        case this.types.number.code:
          this.validateNumber();
          break;
        case this.types.email.code:
          this.validateEmail();
          break;
        case this.types.dob.code:
          break;
      }
    }

    this.isValid.emit(this.isErrorShown);
  }

  validateRequired() {
    if (!this.checkAndSetIsContentExists()) {
      this.showErrors(`${this.label} is required`, '', ErrorTypes.error);
      if (!this.containerClass.includes(this._requiredErrorClass))
        this.containerClass = `${this._textBoxContainerClass.join(' ')} ${this.containerClass} ${this._requiredErrorClass}`;
    }
    else {
      this.resetErrors();
      if (this.containerClass.includes(this._requiredErrorClass))
        this.containerClass = this.containerClass.replace(this._requiredErrorClass, "");
    }
  }

  // Method to validate name
  validateName() {
    if (this.isContentExists && /\d/.test(this.textBoxContent))
      this.showErrors('Need a valid name', `Please ensure the given ${this.label} musn't contain numbers or any other special characters.`, ErrorTypes.warning);
    else this.resetErrors();
  }

  // Method to validate phone number
  validatePhone() {
    if (this.isContentExists) {
      var phone = this.textBoxContent.replace(/[^\d]/g, '');
      if (phone.length < 8 || phone.length > 14)
        this.showErrors("Please give a valid phone number", "Number must contain 10 to 13 digits and shouldn't start with country code", ErrorTypes.warning);
    }
    else this.resetErrors();
  }

  validateNumber() {
    if (this.isContentExists) {
      if (isNaN(+this.textBoxContent))
        this.showErrors("Please give a valid number", "Number must contain only numbers and not any other characters", ErrorTypes.warning);
    }
    else this.resetErrors();
  }

  // Method to validate email address
  validateEmail() {
    const emailCondition = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.resetErrors();

    if (this.required) {
      if (this.isContentExists === false) {
        this.showErrors("Please give email address", "Email address shouldn\'t be empty.", ErrorTypes.error);
      }
      else if (!emailCondition.test(this.textBoxContent)) {
        this.showErrors("Please give a valid email", "Please ensue email address is accurate and functional.", ErrorTypes.warning);
      }
      else {
        this.resetErrors();
      }
    }
  }

  validateDate() {
    this.resetErrors();
    if (this.dateContent == null) {
      this.showErrors("Please give a valid date", "Please give a valid date", ErrorTypes.error);
    } else this.resetErrors();
  }

  // Method to show error messages
  showErrors(title: string, errorMessage: string, errorType: ErrorTypes = ErrorTypes.error) {
    let newError = new Error(title, errorMessage, errorType)
    if (!this.errors.some(e => e.errorTitle === title)) {
      this.errors.push(newError);
      this.isErrorShown = true;
    }
  }

  // Method to hide error messages in certain scenarios (not delete them)
  hideErrors() {
    this.isErrorShown = false;
  }

  // Method to delete error messages and reset error state
  resetErrors() {
    this.errors = [];
    this.isErrorShown = false;
  }

}
