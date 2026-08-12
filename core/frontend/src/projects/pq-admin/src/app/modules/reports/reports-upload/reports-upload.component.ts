import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ReportsService } from '../../../services/reports/reports.service';
import { ConnectReportData, ConnectReportPayload, Report } from '../../../models/reports';
import { ClientsService } from '../../../services/entities/clients.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { StorageService } from '../../../services/app/storage/storage.service';
import { ToastService } from 'pq-ui';
import { validate } from 'uuid';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ReportCheckerService } from '../../../services/reports/report-checker.service';

@Component({
  selector: 'app-reports-upload',
  templateUrl: './reports-upload.component.html',
  styleUrls: ['./reports-upload.component.scss']
})
export class ReportsUploadComponent implements OnInit {

  @Output() dismissEvent: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('fileInput') fileInput: ElementRef | undefined = undefined;
  
  page: string = '';
  @Input() clientId: number = 0;
  @Input() client: any;

  report: ConnectReportPayload = Report.defaultConnectReportPayload();
  reportFile: File | undefined = undefined;

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  currentYear = new Date().getFullYear();
  startYear: number = 2023;
  currentMonth = new Date().getMonth();
  availableYears: number[] = Array.from({ length: this.currentYear - this.startYear + 1 }, (_, index) => this.startYear + index);
  selectedYear: number = (this.currentMonth == 0) ? this.availableYears[this.availableYears.length - 2] : this.availableYears[this.availableYears.length - 1];
  selectedMonth: number = (this.currentMonth == 0) ? this.monthNames.indexOf('December') : this.currentMonth - 1;
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
  isClientLoading = false;
  isUploading = false;
  user: any;
  isAllFieldsValidated: boolean = false;
  isCheckingReport: boolean = false;
  isValidReport = -1;

  isValidationChecklistRead: boolean = false;
  
  constructor(
    private reportsService: ReportsService,
    private clientsService: ClientsService,
    private activatedRoute: ActivatedRoute,
    private reportCheckerService: ReportCheckerService,
    private router: Router,
    private storageService: StorageService,
    private toastService: ToastService
  ) {
   }

  ngOnInit(): void {
    // this.clientId = this.client.id;
    this.report.report_type = 'connect';
    this.user = this.storageService.getItem('userdata');
    this.setupAmbience();
  }

  setupAmbience() {
    // this.getClient();
    // this.report.month = (this.period.selectedPeriod.month > 0)? this.period.monthNames[this.period.selectedPeriod.month - 1] : this.period.monthNames[this.period.selectedPeriod.month];
    this.report.month = this.monthNames[this.period.selectedPeriod.month];
    this.report.year = this.period.selectedPeriod.year;
    this.report.client_id = this.clientId;
    this.setReportName();
  }

  getClient() {
    this.isClientLoading = true;
    this.clientId = this.activatedRoute.snapshot.params['id'];
    const body = {
      client_id: this.clientId
    };
    this.clientsService.getClient(body).subscribe((res: any) => {
      this.isClientLoading = false;
      if(res.status) this.client = res.company;

    });
  }

  saveReport() {
    this.isUploading = true;

    if(this.validateReport()) {
      if(confirm("Do you confirm, you have uploaded final copy of report?")) {  
        if(this.reportFile) {
          this.report.uploaded_by = this.user.user_id;
          this.reportsService.saveReport(this.report, this.reportFile, 'report').subscribe((res: any) => {
            this.isUploading = false;
            if(res.status) {
              this.dismiss();
              this.toastService.show(`${this.report.name} has been saved and sent for approval.`, 'Report saved', 'success', true);
            } else {
              this.toastService.show(`${(res.error.message)? res.error.message : 'Something went wrong while saving the report. Please contact your system administrator if problem persists.'}`, `${(res.error.title)? res.error.title : 'Something went wrong!'}`, `${(res.error.type)? res.error.type : 'warning'}`, true);
            }
          }, error => {
            this.toastService.show(`Something went wrong. Please try again. If problem persists, take a screenshot and please contact administrator.`, 'Something went wrong.', 'error', false, 10000);
          });
        }
      }
    } else this.toastService.show('Please fill all the details to save report');
  }

  validateReport = () => { return ( !this.reportFile)? false : true; }

  async onFileSelected(event: Event, ele: any) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      if(file.name.split('.')[1] != 'pdf') {
        alert('Please choose a valid pdf file');
        event.preventDefault();
        this.resetFileInput();
        ele.nativeElement.value = '';
        return;
      } else {
        const body = {
          code: this.client.value.name
        };
        this.isCheckingReport = true;
        this.reportCheckerService.checkReportClient(file, body).subscribe({
          next: (res: any) => {
            this.isCheckingReport = false;
            if(res.status) {
              this.reportFile = file;
              this.isValidReport = 1;
              this.toastService.show('Valid report selected', 'Valid Report', 'success', true);

            } else {
              this.isValidReport = 0;
              if(res.error_type == 'invalid') 
                this.toastService.show('The selected report does not match the selected client. Please selected the correct report intended for the client.', 'Invalid Report', 'error', true);
              else
                this.toastService.show(res.error, 'Something went wrong', 'error', true);
              event.preventDefault();
              this.resetFileInput();
              ele.value = '';
            }
            this.validateReport();
          },
          error: (err: any) => {
            this.isValidReport = 0;
            this.isCheckingReport = false;
            event.preventDefault();
            ele.value = '';
            this.resetFileInput();
          }
        });
      }
    }
  }

  resetFileInput() {
    this.fileInput!.nativeElement.value = '';
    this.reportFile = undefined;
  }

  setMonth(monthText: string) {
    const month = Number.parseInt(monthText);
    this.report.month = this.period.monthNames[month];
    this.period.selectedPeriod.month = month;
    this.setReportName();

  }

  setYear(year: string) {
    this.report.year = this.toNumber(year);
    this.setReportName();
  }

  setReportName() {
    this.report.name = `Monthly Connect Report ${this.report.month} ${this.report.year}`;
  }
   
  toNumber(value: string) {
    return Number.parseInt(value);
  }

  goBack() {
    this.router.navigate(['reports', this.page.toLowerCase(), 'list', (this.clientId != 0)? this.clientId : '']);
  }

  dismiss() {
    this.dismissEvent.emit(true);
  }
}
