import { Component, OnInit } from '@angular/core';
import { RssService } from '../../../services/newsletters/rss.service';
import { subscribeOn } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

@Component({
  selector: 'app-newsletters',
  templateUrl: './newsletters.component.html',
  styleUrls: ['./newsletters.component.scss']
})
export class NewslettersComponent implements OnInit {

  feedItems: any[] = [];
  currentLink: SafeUrl = '';
  currentIndex = 0;
  isNewsLettersLoading = false;
  isNewsLetterLoading = false;

  // common variables
  period: { 
    years: number[],
    monthNames: string[],
    selectedPeriod: { date: number, month: number, year: number }
  } = {
    years: [2024, 2023],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selectedPeriod: { date: new Date().getDate(), month: 0, year: new Date().getFullYear() }
  };

  master_company: any;

  constructor(
    private rssService: RssService,
    private sanitizer: DomSanitizer,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    const rssFeedUrl = 'https://us16.campaign-archive.com/feed?u=e6a239cbdcf8422683c74fa76&id=5f99ab1632';
    this.master_company = this.localStorageService.getItem('userdata').master_company;
    if(this.period.selectedPeriod.month == 0 && (new Date().getDate() < 7)) {
      // If the date is within Jan 1st week, previous year will be selected not less than 2023
    }
    this.loadRssFeed();
  }

  async loadRssFeed() {
    this.isNewsLettersLoading = true;
    this.feedItems = [];
    const body = {
      year: this.period.selectedPeriod.year,
      master_company_id: this.master_company.id
    };
    this.rssService.getNewsletters(body).subscribe((res: any) => {
      this.isNewsLettersLoading = false;
      this.feedItems = res.data;
      this.openURL(this.feedItems[0].link, 0);
    });
  }

  openURL(feed: string, index: number) {
    this.isNewsLetterLoading = true;
    this.currentLink = this.sanitizer.bypassSecurityTrustResourceUrl(feed);
    console.log('current link ', feed);
    this.currentIndex = index;
  }

  convertToNumber = (value: string) => { return /^\d+$/.test(value)? Number(value) : 0; }

}
