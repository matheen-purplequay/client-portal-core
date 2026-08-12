import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-slide-button',
  templateUrl: './slide-button.component.html',
  styleUrls: ['./slide-button.component.scss']
})
export class SlideButtonComponent implements OnInit, AfterViewInit {

  @ViewChild('slideButtonContainer') buttonContainer: ElementRef | undefined;
  button_container: any;
  
  @Input() wrapperClass: string = '';
  @Input() containerClass: string = '';
  @Input() sliderTextClass: string = '';
  @Input() sliderText: string = '';
  @Output() completedEvent: EventEmitter<boolean> = new EventEmitter(false);

  buttonPosition: number = 0;
  isDragging: boolean = false;
  friction: number = 0.5;
  @Input() isLoading: boolean = false;
  @Input() isDisabled: boolean = false;

  constructor() {}
  
  ngOnInit() {
  }
  
  ngAfterViewInit(): void {
    this.button_container = this.buttonContainer?.nativeElement;
  }

  startDrag(event: MouseEvent): void {
    this.isDragging = true;
  }

  onDrag(event: MouseEvent): void {
    if (this.isDragging) {
      const sliderContainer = document.querySelector('.slider-container') as HTMLElement;
      const sliderButton = document.querySelector('.slider-button') as HTMLElement;
      const containerRect = sliderContainer.getBoundingClientRect();
      const buttonWidth = sliderButton.getBoundingClientRect().width;
      const newPosition = Math.max(0, Math.min(event.clientX - containerRect.left, containerRect.width - buttonWidth));
      const targetPosition = Math.max(0, Math.min(event.clientX - containerRect.left, containerRect.width - buttonWidth));

      this.buttonPosition += (targetPosition - this.buttonPosition) * this.friction;

      if (this.buttonPosition >= containerRect.width - (buttonWidth + 1)) {
        // Trigger your function only when the button is dragged to the rightmost end
        this.triggerFunction();
        this.stopDrag();
      }
    }
  }

  @HostListener('window:mouseup', ['$event'])
  stopDrag(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.buttonPosition = 0;
    }
  }

  resetDrag() {
    this.buttonPosition = 0;
  }

  triggerFunction(): void {
    this.emitCompletedEvent();
  }

  emitCompletedEvent() {
    this.completedEvent.emit(true);
  }

}
