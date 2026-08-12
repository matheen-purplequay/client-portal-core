import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

const MAXSECONDS = 5;

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new Subject<{
    message: string, 
    title: string, 
    type: string,
    dismissable: boolean,
    maxSeconds: number,
    showCopy: boolean
  }>();
  toastState$ = this.toastSubject.asObservable();

  show(message: string, title = '', type = 'default', dismissable = false, maxSeconds = MAXSECONDS, showCopy = false) {
    this.toastSubject.next({
      message: message,
      title: title,
      type: type,
      dismissable: dismissable, 
      maxSeconds: maxSeconds,
      showCopy: showCopy
    });

    return new Promise(resolve => setTimeout(resolve, maxSeconds));
  }

  clear() {
    this.toastSubject.next({
      message: '',
      title: '',
      type: 'default',
      dismissable: false, 
      maxSeconds: MAXSECONDS,
      showCopy: false
    });
  }
}
