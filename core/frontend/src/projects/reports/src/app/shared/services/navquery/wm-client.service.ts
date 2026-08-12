// client-user.service.ts
import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientUserService {
  private userChangedSource = new Subject<any>();

  userChanged$ = this.userChangedSource.asObservable(); // Observable to subscribe

  emitUserChange(user: any) {
    this.userChangedSource.next(user); // Emit from anywhere
  }
}
