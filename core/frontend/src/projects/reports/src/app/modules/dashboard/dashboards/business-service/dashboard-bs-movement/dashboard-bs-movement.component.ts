import { Component, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { LocalStorageService } from 'projects/reports/src/app/services/app/storage/local-storage.service';

@Component({
  selector: 'app-dashboard-bs-movement',
  templateUrl: './dashboard-bs-movement.component.html',
  styleUrls: ['./dashboard-bs-movement.component.scss']
})
export class DashboardBsMovementComponent implements OnInit, OnChanges {
  @ViewChild('dashMovement') dashMovementRef!: ElementRef;
  isComponentLoaded: boolean = false;
  userData : any;
  selectedClientUser: any;
  isTester: boolean = false;

  constructor(
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.userData = this.localStorageService.getItem('userdata');
    this.isTester = this.localStorageService.getItem('userdata').is_tester || false;
    this.selectedClientUser = this.localStorageService.getItem('wm_user');
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

}
