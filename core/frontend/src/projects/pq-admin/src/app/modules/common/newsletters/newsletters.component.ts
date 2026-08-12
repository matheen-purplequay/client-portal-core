import { Component, OnInit } from '@angular/core';
import { CommonData, NewslettersData } from '../../../models/common';
import { CommonService } from '../../../services/common/common.service';
import { ToastService } from 'pq-ui';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { StorageService } from '../../../services/app/storage/storage.service';


@Component({
  selector: 'app-newsletters',
  templateUrl: './newsletters.component.html',
  styleUrls: ['./newsletters.component.scss']
})
export class NewslettersComponent implements OnInit {

  newslettersPayload: NewslettersData = CommonData.defaultNewslettersData();
  newslettersData: NewslettersData[] = [];
  isFetchingNewsletters: boolean = false;
  isNewsletterLoading: boolean = false;
  currentLink: SafeUrl = '';
  currentIndex = 0;

  master_companies_list = {
    carisma: { index: 1, label: 'Carisma Solutions' },
    purplequay: { index: 2, label: 'Purple Quay' }
  };

  master_companies = {
    list: Object.values(this.master_companies_list),
    selectedCompany: this.master_companies_list.carisma,
    keys: { key: 'index', value: 'label' }
  };

  period: { 
    years: number[],
    monthNames: string[],
    selectedPeriod: { date: number, month: number, year: number }
  } = {
    years: [2023, 2024],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selectedPeriod: { date: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear() }
  };

  newsletterPermissions: any;

  constructor(
    private commonService: CommonService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.newsletterPermissions = this.storageService.getItem('permissions').newsletters;
    this.setupAmbience();
  }

  setupAmbience() {
    if(this.period.selectedPeriod.month == 0 && (new Date().getDate() < 7)) {
      // If the date is within Jan 1st week, previous year will be selected not less than 2023
      this.period.selectedPeriod.year = ((this.period.selectedPeriod.year - 1) >= 2023)? this.period.selectedPeriod.year - 1 : 2023;
      this.newslettersPayload.month = this.period.selectedPeriod.month;
      this.newslettersPayload.year = this.period.selectedPeriod.year;
    } else {
      this.newslettersPayload.month = this.period.selectedPeriod.month;
      this.newslettersPayload.year = this.period.selectedPeriod.year;
    }
    this.getNewsletters();
  }

  getNewsletters() {

    
    this.isFetchingNewsletters = true;
    this.newslettersData = [];
    this.currentLink = this.sanitizer.bypassSecurityTrustResourceUrl('');

    const body = {
      year: this.period.selectedPeriod.year,
      master_company_id: this.master_companies.selectedCompany.index
    };

    this.commonService.getNewsletters(body).subscribe((res: any) => {
      this.isFetchingNewsletters = false;
      if(res.status) {
        this.newslettersData = res.data;
        this.previewNewsletter(this.newslettersData[0].link, 0);
      } 
    });
  }

  previewNewsletter(link: string, index: number) {
    this.isNewsletterLoading = true;
    this.currentLink = this.sanitizer.bypassSecurityTrustResourceUrl(link);
    this.currentIndex = index;
  }

  saveNewsletter() {

    this.commonService.saveNewsletter(this.newslettersPayload).subscribe({
      next: (res: any) => {

        if(res.status) {
          this.toastService.show(`${this.newslettersPayload.month} ${this.newslettersPayload.year} newsletter saved`, 'Saved', 'success', true);
          this.resetNewsletterPayload();
          this.getNewsletters();
        } else this.toastService.show(`Something went wrong while saving newsletter`, 'Something went wrong', 'error', true);
      },
      error: (err: any) => {
        this.toastService.show(`Something went wrong while saving newsletter`, 'Something went wrong', 'error', true);
      }
    });
  }

  updateNewsletter() {
    this.commonService.updateNewsletter(this.newslettersPayload).subscribe((res: any) => {

      
      this.toastService.show(`${this.newslettersPayload.month} ${this.newslettersPayload.year} newsletter updated`, 'Updated', 'success', true);
      this.resetNewsletterPayload();
      this.getNewsletters();
    });
  }

  deleteNewsletter() {
    const body = {
      id: this.newslettersPayload.id
    };
    this.commonService.deleteNewsletter(body).subscribe((res: any) => {
      this.toastService.show(`${this.newslettersPayload.month} ${this.newslettersPayload.year} newsletter deleted`, 'Deleted', 'success', true);
      this.resetNewsletterPayload();
      this.currentLink = '';
      this.getNewsletters();
    });
  }

  convertToNumber = (value: string) => { return /^\d+$/.test(value)? Number(value) : 0; }

  resetNewsletterPayload() {
    this.newslettersPayload = CommonData.defaultNewslettersData();

  }

}
