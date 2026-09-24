import { Component, OnInit, OnChanges, OnDestroy, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'projects/reports/src/app/services/app/storage/local-storage.service';
import { ClientUserService } from 'projects/reports/src/app/shared/services/navquery/wm-client.service';

@Component({
  selector: 'app-dashboard-bs-movement',
  templateUrl: './dashboard-bs-movement.component.html',
  styleUrls: ['./dashboard-bs-movement.component.scss']
})
export class DashboardBsMovementComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('dashMovement') dashMovementRef!: ElementRef;
  isComponentLoaded: boolean = false;
  userData : any;
  selectedClientUser: any;
  isTester: boolean = false;

  private subscription!: Subscription;

  constructor(
    private localStorageService: LocalStorageService,
    private clientUserService: ClientUserService
  ) { }

  ngOnInit(): void {
    this.userData = this.localStorageService.getItem('userdata');
    this.isTester = this.localStorageService.getItem('userdata').is_tester || false;
    this.selectedClientUser = this.localStorageService.getItem('wm_user');

    // Keep the widget in sync when the navbar's client-user dropdown changes,
    // since it only reads localStorage once above otherwise.
    this.subscription = this.clientUserService.userChanged$.subscribe(user => {
      this.selectedClientUser = user;
      if (this.dashMovementRef) {
        this.dashMovementRef.nativeElement.selectedClientUser = this.selectedClientUser;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData'] && !changes['userData'].firstChange) {
      this.isComponentLoaded = true;
    }

    this.userData = this.localStorageService.getItem('userdata');
    if (changes['selectedClientUser'] && this.dashMovementRef) {
      this.dashMovementRef.nativeElement.selectedClientUser = this.selectedClientUser;
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
