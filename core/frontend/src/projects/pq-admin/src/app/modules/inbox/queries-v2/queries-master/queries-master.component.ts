import { Component, OnInit } from '@angular/core';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';

@Component({
  selector: 'app-queries-master',
  templateUrl: './queries-master.component.html',
  styleUrls: ['./queries-master.component.scss']
})
export class QueriesMasterComponent implements OnInit {

  user: any;

  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getItem('userdata');
  }

}
