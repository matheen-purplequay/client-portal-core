import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../services/app/common/common.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.scss']
})
export class MyTeamComponent implements OnInit {

  associates: {
    name: string;
    role: { id: number, title: string };
    vertical:  { id: number, title: string };
    email: string;
  }[] = [];
  others: {
    name: string;
    role: { id: number, title: string };
    vertical:  { id: number, title: string };
    email: string;
  }[] = [];
  directors: {
    name: string;
    role: { id: number, title: string };
    vertical:  { id: number, title: string };
    email: string;
  }[] = [];
  company_id: number = 0;
  isTeamLoading = false;

  constructor(
    private commonService: CommonService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.company_id = this.localStorageService.getItem('userdata').company_id;
    this.getMyTeam();
  }

  getMyTeam() {
    this.resetAll();
    this.isTeamLoading = true;
    const body = {
      client_id: this.company_id
    };
    this.commonService.getMyTeamData(body).subscribe((res: any) => {
      console.log('teams ', res);
      
      this.isTeamLoading = false;
      this.associates = res.data.associates;
      this.others = res.data.others;
      this.directors = res.data.directors;
    });
  }

  resetAll() {
    this.associates = [];
    this.others = [];
    this.directors = [];
  }

}
