import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-center-slide-button',
  templateUrl: './center-slide-button.component.html',
  styleUrls: ['./center-slide-button.component.scss']
})
export class CenterSlideButtonComponent implements OnInit {

  buttonElement: HTMLElement | undefined;
  boxWidth: number = 0;
  startX: number = 0;
  buttonPosition: number = 50; // Initial position (50% from left)

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.buttonElement = this.el.nativeElement.querySelector('button');
    this.boxWidth = this.el.nativeElement.querySelector('.box').offsetWidth;
  }

  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.startX = event.clientX;
  }

  onMouseMove(event: MouseEvent) {
    const deltaX = event.clientX - this.startX;
    const newPosition = this.buttonPosition + deltaX;

    if (newPosition >= 0 && newPosition <= 100) {
      this.buttonPosition = newPosition;
      this.buttonElement!.style.left = `${this.buttonPosition}%`;
    }
  }

  onMouseUp() {
    if (this.buttonPosition <= 10) {
      this.leftFunction();
    }
    if (this.buttonPosition >= 90) {
      this.rightFunction();
    }
    this.buttonPosition = 50; // Reset to center
    this.buttonElement!.style.left = '50%';
  }

  leftFunction() {
  }

  rightFunction() {
  }

}
