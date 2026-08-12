import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Agreed, AgreedData, AgreedJobDetailsData, AgreedPayload } from '../../../models/reports';
import { BehaviorSubject } from 'rxjs';
import { Activities, Activity } from '../../../models/activities';
import { ReportsService } from '../../../services/reports/reports.service';
import { ToastService } from 'pq-ui';

@Component({
  selector: 'app-agreed-list',
  templateUrl: './agreed-list.component.html',
  styleUrls: ['./agreed-list.component.scss']
})
export class AgreedListComponent implements OnInit {

  @Output() dismissEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() activityChangedEvent: EventEmitter<number> = new EventEmitter();
  @Input() refresh: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() selectedClient: BehaviorSubject<{ works_manager_client_id: number; name: string; }> = new BehaviorSubject({ works_manager_client_id: 0, name: '' });

  // state variable
  activity: { list: Activities, current: number } = {
    list: Activity.defaultActivities(),
    current: Activity.defaultActivity()
  };

  // status variables
  isAgreedLoading: boolean = false;
  isAgreedSaving: boolean = false;

  // agreed variables
  agreedPayload: AgreedPayload = Agreed.defaultAgreedPayload();
  agreedData: AgreedJobDetailsData[] = [];
  agreedJobDetailsFile: File | undefined = undefined;

  isNoJobsinHand: boolean = false;

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  currentYear = new Date().getFullYear();
  startYear: number = 2023;
  currentMonth = new Date().getMonth();
  availableYears: number[] = Array.from({ length: this.currentYear - this.startYear + 1 }, (_, index) => this.startYear + index);
  selectedYear: number = (this.currentMonth == 0) ? this.availableYears[this.availableYears.length - 2] : this.availableYears[this.availableYears.length - 1];
  selectedMonth: number = (this.currentMonth == 0) ? this.monthNames.indexOf('December') : this.currentMonth;
  isReportsLoading: boolean = false;

  period: { 
    years: number[],
    monthNames: string[],
    selectedPeriod: { date: number, month: number, year: number }
  } = {
    years: this.availableYears,
    monthNames: this.monthNames,
    selectedPeriod: { date: new Date().getDate(), month: this.selectedMonth, year: this.selectedYear }
  };

  constructor(
    private reportService: ReportsService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.agreedPayload.month = this.period.monthNames[this.period.selectedPeriod.month];
    this.selectedClient.subscribe(client => {

      this.agreedPayload.project_id = client.works_manager_client_id;
    });
    this.getAgreed();
  }

  getAgreed() {
    this.isAgreedLoading = true;
    const month1 = (this.period.selectedPeriod.month >= 0)? this.period.monthNames[this.period.selectedPeriod.month] : 'January';

    const body = {
      project_id: this.selectedClient.value.works_manager_client_id,
      month: this.period.monthNames[this.period.selectedPeriod.month],
      month1: month1,
      month2: '',
      month3: '',
      year: this.period.selectedPeriod.year
    };
    
    // 3 Months Data
    this.reportService.getAgreedJobs(body).subscribe((res: any) => {
      this.isAgreedLoading = false;
      if(res.length > 0) this.agreedPayload = res[0];

    });

    // Table Data
    this.reportService.getAgreedJobDetails(body).subscribe((res: any) => {
      this.isAgreedLoading = false;
      if(res) this.agreedData = res;

    });
  }

  saveAgreed() {
    if(!this.isAgreedSaving) {
      if(this.agreedJobDetailsFile) {
        this.isAgreedSaving = true;
        if(this.agreedPayload.year == 0 || this.agreedPayload.year == undefined || this.agreedPayload.year == null) this.agreedPayload.year = new Date().getFullYear();
        this.agreedPayload.project_id = this.selectedClient.value.works_manager_client_id;
        this.reportService.saveAgreed(this.agreedPayload, this.agreedJobDetailsFile, 'excel_file').subscribe((res: any) => {
          if(res.status) {

            this.isAgreedSaving = false;
            this.toastService.show('Agreed details saved', 'Saved', 'success', true);
            this.getAgreed();
          } else if(!res.status) {

            this.toastService.show(res.message, 'Something went wrong', 'error', true);
            this.isAgreedSaving = false;
          } else {

          }
        }, error => {
          this.toastService.show(error.message, 'Something went wrong', 'error', true);
          this.isAgreedSaving = false;

        });
      } else {
        if(this.isNoJobsinHand) {
          this.reportService.saveAgreedWithoutJobs(this.agreedPayload).subscribe(res => {

            this.isAgreedSaving = false;
            this.toastService.show('Agreed details saved ', 'Saved', 'success', true);
            this.getAgreed();
          }, error => {
            this.isAgreedSaving = false;
            this.toastService.show('Something went wrong while saving agreed details. Please try again.', 'Something went wrong', 'warning', true);

          });
        } else {
          this.toastService.show('Please upload excel template to save agreed details if no jobs in hand.')
          return;
        }
      }
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const names = target.files[0].name.split('.');
      if(names[names.length - 1] != 'xls' && names[names.length - 1] != 'xlsx') {

        alert('Please choose a valid excel file');
        event.preventDefault();
        return;
      } else {
        this.agreedJobDetailsFile = target.files[0];
        target.value = '';
      }
    }
  }

  setMonth(monthText: string) {
    const month = Number.parseInt(monthText);
    this.period.selectedPeriod.month = month;
    this.agreedPayload.month = this.period.monthNames[this.period.selectedPeriod.month];
    console.log('chosen month ', this.agreedPayload.month, this.period.monthNames[this.period.selectedPeriod.month], this.period.selectedPeriod.month, monthText);
    
    this.getAgreed();
  }

  downloadTemplate() {
    this.reportService.downloadAgreedTemplate().subscribe((data: any) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = "template.xlsx";
      link.click();
    });
  }

  toNumber = (value: string) => { return parseInt(value); }

  dismiss() {
    this.dismissEvent.emit(true);
  }
}
