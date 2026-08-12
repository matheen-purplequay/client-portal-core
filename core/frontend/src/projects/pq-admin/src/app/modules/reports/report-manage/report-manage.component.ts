import { TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectReportData, ConnectReportPayload, Report } from '../../../models/reports';
import { ClientsService } from '../../../services/entities/clients.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../../../services/app/storage/storage.service';
import { UserService } from '../../../services/entities/user.service';
import party from "party-js";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-report-manage',
  templateUrl: './report-manage.component.html',
  styleUrls: ['./report-manage.component.scss']
})
export class ReportManageComponent implements OnInit {

  @Output() dismissEvent: EventEmitter<boolean> = new EventEmitter();

  page: string = '';
  reportId: number = 0;
  @Input() report: ConnectReportData = Report.defaultConnectReportData();
  reportFile: File | undefined = undefined;
  @Input() client: any;

  period: { 
    years: number[],
    monthNames: string[],
    selctedPeriod: { date: number, month: number, year: number }
  } = {
    years: [2023],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selctedPeriod: { date: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear() }
  };
  isClientLoading = false;
  isReportLoading = false;

  pdfURL: SafeUrl =  '';
  pdfData: BehaviorSubject<Uint8Array | ArrayBuffer | undefined> = new BehaviorSubject<Uint8Array | ArrayBuffer | undefined>(undefined);
  isPDFLoading = false;

  user: any;
  isApproving = false;
  isRejecting = false;
  isReseting = false;

  userPermissions: any;
  isConfirmed: boolean = false;

  rejectReason: string = '';
  deleteReason: string = '';

  public Editor = ClassicEditor;
  public config = {
    placeholder: 'Add custom sections for report here...',
    toolbar: {
      items: [
        'undo', 'redo',
        '|', 'heading',
        '|', 'bold', 'italic',
        '|', 'link', 'insertTable', 'blockQuote',
        '|', 'bulletedList', 'numberedList', 'outdent', 'indent'
      ]
    },
  }
  
  constructor(
    private reportsService: ReportsService,
    private clientsService: ClientsService,
    private activatedRoute: ActivatedRoute,
    private titleCasePipe: TitleCasePipe,
    private router: Router,
    private sanitizer: DomSanitizer,
    private storageService: StorageService,
    private userService: UserService
  ) {
  }
  
  ngOnInit(): void {
    this.userPermissions = this.storageService.getItem('permissions').connect_report;
    
    this.reportId = this.report.id;
    this.page = this.titleCasePipe.transform(this.activatedRoute.snapshot.data['page']);

    
    this.setupAmbience();
  }

  setupAmbience() {
    // this.report.month = this.period.monthNames[this.period.selctedPeriod.month - 1];
    // this.report.year = this.period.selctedPeriod.year;
    this.user = this.storageService.getItem('userdata');
    // this.getClient();
    this.previewReport();
  }

  getReport() {
   this.isReportLoading = true;
    const body = {
      report_id: this.report.id,
    };

    this.reportsService.getReportByID(body).subscribe((res: any) => {
      this.isReportLoading = false;
      this.report = res.data;
      // this.getClient();
      this.previewReport();
    });
  }

  getClient() {
    this.isClientLoading = true;
    const body = {
      client_id: this.report.client_id
    };
    this.clientsService.getClient(body).subscribe((res: any) => {
      this.isClientLoading = false;
      if(res.status) this.client = res.company;
    });
  }

  previewReport() {
    this.isPDFLoading = true;
    const body = {
      report_id: this.report.id,
      report_type: 'connect'
    }
    this.reportsService.getReportPreview(body).subscribe((res: any) => {
      this.isPDFLoading = false;
      this.pdfData.next(res);
      this.createPdfBlobUrl(res);
    });
  }

  private createPdfBlobUrl(data: Uint8Array | ArrayBuffer): void {
    this.pdfURL = 'about:blank';
    const blob = new Blob([data], { type: 'application/pdf' });

    // Use the DomSanitizer to create a safe URL
    this.pdfURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }

  approveReport() {
    if(!this.isConfirmed) return;
    this.isApproving = true;

    const body = {
      report_id: this.report.id,
      role: this.user.role,
      user_id: this.user.user_id,
      type: 'approved'
    };
    this.reportsService.approveReport(body).subscribe((res: any) => {
      this.isApproving = false;
      this.showConfetti();

      this.getReport();
    });
    // if(confirm("Do you confirm, you are about to approve the report?")) {  
    // } else this.isApproving = false;
  }

  rejectReport() {
    if(!this.isConfirmed) return;
    this.isRejecting = true;

    const body = {
      report_id: this.report.id,
      role: this.user.role,
      user_id: this.user.user_id,
      type: 'rejected',
      reason: this.rejectReason
    };
    if(confirm("Do you confirm, you are about to reject the report?")) {  
      this.reportsService.rejectReport(body).subscribe((res: any) => {
        this.isRejecting = false;

        this.getReport();
      });
    } else this.isRejecting = false;
  }

  resetReport() {
    this.isReseting = true;

    const body = {
      report_id: this.report.id,
      user_id: this.user.user_id
    };
    if(confirm("Do you confirm, you are about to reset the report?")) {  
      this.reportsService.resetReport(body).subscribe((res: any) => {
        this.isReseting = false;

        this.getReport();
      });
    } else this.isReseting = false;
  }

  deleteReport() {
    if(confirm("Do you confirm, you are about to delete the report?")) {  
      const body = {
        report_id: this.report.id,
        reason: this.deleteReason
      };
      this.reportsService.deleteReport(body).subscribe((res: any) => {
        if(res.status) {
          this.dismiss();
        }
      });
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.reportFile = target.files[0];

    }
  }
   
  toNumber(value: string) {
    return Number.parseInt(value);
  }

  goBack() {
    this.router.navigate(['reports', this.page.toLowerCase(), 'list', (this.report.client_id != 0)? this.report.client_id : '']);
  }

  dismiss() {
    this.dismissEvent.emit(true);
  }

  showConfetti() {
    setTimeout(() => {
      const button = document.getElementById('confetti-container') as HTMLElement;
      party.confetti(button);
    }, 500);
  }

  convertToNumber = (value: string) => Number(value);
}
