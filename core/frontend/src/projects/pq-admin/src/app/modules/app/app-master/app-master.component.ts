import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SimpleTab } from 'pq-ui';

@Component({
  selector: 'app-app-master',
  templateUrl: './app-master.component.html',
  styleUrls: ['./app-master.component.scss']
})
export class AppMasterComponent implements OnInit {

  appPagesList = {
    updates: { index: 0, label: 'Updates', data: { code: 'updates', page: 'updates' } },
    greetings: { index: 1, label: 'Greetings', data: {code: 'greetings', page: 'greetings'} }
  };

  appPages: { list: SimpleTab[], selectedPage: SimpleTab } = {
    list: Object.values(this.appPagesList),
    selectedPage: this.appPagesList.updates
  };

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  openAppPage(page: string) {
    this.router.navigate(['app', page]);
  }

}
