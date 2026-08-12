import { Component, ElementRef, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

@Component({
  selector: 'app-dashboard-insights',
  templateUrl: './dashboard-insights.component.html',
  styleUrls: ['./dashboard-insights.component.scss']
})
export class DashboardInsightsComponent implements OnInit {
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
