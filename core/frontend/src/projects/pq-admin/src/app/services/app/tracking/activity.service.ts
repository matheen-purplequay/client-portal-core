import { Injectable } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private inactivityTimeout = 60 * 60 * 1000; // 30 minutes in milliseconds
  private activity$ = new Subject<void>();
  private timerSubscription: any;

  constructor(
  ) {
    this.resetTimer();
  }

  public resetTimer() {
    this.activity$.next();
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.timerSubscription = timer(this.inactivityTimeout).subscribe(() => {
      localStorage.clear();
      window.location.href = '/login';
    });
  }

  public userActivity() {
    this.resetTimer();
  }
}
