import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TipsPopupService } from '../../services/app/notifications/tips-popup.service';

export interface TipsPopupContent {
  title: string;
  body: string;
  image: string;
  type: string,
  dismissable: boolean;
  duration: number;
}

export class TipsPopupContent {
  static defaultTipsPopupContent() {
    return {
      title: '',
      body: '',
      image: '',
      type: 'default',
      dismissable: true,
      duration: 2000
    } as TipsPopupContent;
  }
}

@Component({
  selector: 'app-tips-popup',
  templateUrl: './tips-popup.component.html',
  styleUrls: ['./tips-popup.component.scss']
})
export class TipsPopupComponent implements OnInit {
  
  containerClass: string = '';
  popupStyles: { [key: string]: string[] } = {
    default: ['popup-default', 'bg-color-lightest', 'bg-blur-8'],
    light: ['popup-default', 'bg-color-lightest', 'bg-blur-8'],
    dark: ['popup-default', 'bg-dark', 'text-white']
  };
  showTipsPopup: boolean = false;
  content: TipsPopupContent = TipsPopupContent.defaultTipsPopupContent();

  constructor(
    private tipsPopupService: TipsPopupService
  ) { }

  ngOnInit() {
    this.tipsPopupService.showTipsPopup$.subscribe(show => this.showPopup(show.title, show.body, show.image, show.type, show.duration, show.dismissable));
  }

  showPopup(title: string, body: string, image: string = '', type: string, duration = 2000, dismisable: boolean = false) {
    this.containerClass = `${this.popupStyles[type].join(' ')}`;
    this.content.title = title;
    this.content.body = body;
    this.content.image = image;
    this.showTipsPopup = true;
    
    setTimeout(() => {
      this.hidePopup();
    }, duration);
  }

  hidePopup() {
    this.showTipsPopup = false;
    this.content.title = '';
    this.content.body = '';
    this.content.image = '';
  }
}
