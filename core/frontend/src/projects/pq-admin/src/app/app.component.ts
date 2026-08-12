import { Component, OnInit } from '@angular/core';
import { ActivityService } from './services/app/tracking/activity.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter, map } from 'rxjs';
import { settings } from '../environments/settings';
import { StorageService } from './services/app/storage/storage.service';
import { CloudMessagingService } from './services/app/network/cloud-messaging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'pq-admin';
  currentPage: string = '';

  constructor(
    private activityService: ActivityService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private storageService: StorageService,
    private cloudMessagingService: CloudMessagingService
  ) { }

  ngOnInit(): void {
    this.currentPage = this.activatedRoute.snapshot.data['activity'];

    document.addEventListener('click', this.onUserActivity.bind(this));
    document.addEventListener('keydown', this.onUserActivity.bind(this));
    document.addEventListener('mousemove', this.onUserActivity.bind(this));

    window.addEventListener('DOMContentLoaded', () => {
      let displayMode = 'browser tab';
      if (window.matchMedia('(display-mode: standalone)').matches) {
        displayMode = 'standalone';
      }
    });

    this.cloudMessagingService.requestPermission();
    this.cloudMessagingService.receiveMessage();
  }

  onUserActivity(event: any) {
    this.activityService.resetTimer();
  }

  loadIntelli() {
    let body = <HTMLDivElement>document.body;
    let script = document.createElement('script');
    script.innerHTML = '';
    script.src = settings.external_services_links.intelli;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    body.appendChild(script);
  }
}
