import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../../services/app/storage/storage.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
  }

}
