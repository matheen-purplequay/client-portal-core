import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StorageService } from '../../../services/app/storage/storage.service';

@Component({
  selector: 'app-authentication-master',
  templateUrl: './authentication-master.component.html',
  styleUrls: ['./authentication-master.component.scss']
})
export class AuthenticationMasterComponent implements OnInit, OnDestroy {

  user: any;
  currentYear: number = new Date().getFullYear();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService
  ) {
    document.body.classList.add('bg-auth-gradient');

    if(this.activatedRoute.snapshot.data['activity'] == 'logout') {
      localStorage.clear();
      this.router.navigate(['']);
    } else if(this.activatedRoute.snapshot.data['activity'] == 'login') {
      if(this.storageService.getItem('userdata')) {
        // this.router.navigate(['dashboard']);
      }
    }
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    document.body.classList.remove('bg-auth-gradient');
  }
}
