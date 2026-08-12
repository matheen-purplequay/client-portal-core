import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipsPopupService {
  private showTipsPopup = new Subject<{
    title: string, 
    body: string, 
    image: string,
    type: string,
    dismissable: boolean,
    duration: number,
  }>();
  showTipsPopup$ = this.showTipsPopup.asObservable();

  constructor() { }
  
  showPopup(title: string, body: string, image: string, type: string = 'default', dismissable: boolean = true, duration: number = 5000) {
    this.showTipsPopup.next({
      title: title,
      body: body,
      image: image,
      type: type,
      dismissable: dismissable,
      duration: duration
    });
  }

  hidePopup() {
    this.showTipsPopup.next({
      title: '',
      body: '',
      image: '',
      type: 'default',
      dismissable: false,
      duration: 0
    });
  }
}
