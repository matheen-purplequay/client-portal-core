import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../services/common/common.service';
import { CommonData, ITPolicyData } from '../../../models/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from 'pq-ui';

@Component({
  selector: 'app-it-policy',
  templateUrl: './it-policy.component.html',
  styleUrls: ['./it-policy.component.scss']
})
export class ItPolicyComponent implements OnInit {

  policiyPayload: ITPolicyData = CommonData.defaultITPolicy();
  policies: ITPolicyData[] = [];
  isPolicyLoading: boolean = false;

  currentLink: SafeUrl = '';
  currentIndex: number = 0;

  policyFile: File | undefined = undefined;

  pdfURL: SafeUrl =  '';
  pdfData: BehaviorSubject<Uint8Array | ArrayBuffer | undefined> = new BehaviorSubject<Uint8Array | ArrayBuffer | undefined>(undefined);

  isSavingPolicy: boolean = false;
  isLoadingPolicy: boolean = false;

  constructor(
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.getITPolicies();
  }

  getITPolicies(id: number = -1) {
    this.isLoadingPolicy = true;
    this.commonService.getITPolicies().subscribe((res: any) => {
      this.isLoadingPolicy = false;
      
      if(res.status) this.policies = res.data;
      if(this.policies.length > 0) {
        if(id != -1) this.previewITPolicy(id, this.policies.length - 1);
        else this.previewITPolicy(this.policies[0].id!, 0);
      };
    });
  }

  saveITPolicy() {
    if(this.policyFile) {
      this.isSavingPolicy = true;
      this.policiyPayload.date_of_issue = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
      this.commonService.saveITPolicy(this.policiyPayload, this.policyFile, 'policy').subscribe((res: any) => {
        this.isSavingPolicy = false;
        if(res.status) {
          this.policiyPayload = CommonData.defaultITPolicy();
          this.toastService.show('IT Policy uploaded', 'Uploaded', 'success', true);
          this.getITPolicies(res.data.id);
        } else { 
          this.toastService.show('Something went wrong while saving IT policy.', 'Something went wrong', 'warning', true);
        }
      });
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      if(target.files[0].name.split('.')[1] != 'pdf') {
        alert('Please choose a valid pdf file');
        return;
      } else {
        this.policyFile = target.files[0];
      }
    }
  }

  previewITPolicy(id: number, index: number) {
    this.isPolicyLoading = true;
    this.currentIndex = index;
    let body = {
      it_id: id
    };
    this.commonService.previewITPolicy(body).subscribe((res: any) => {
      this.isPolicyLoading = false;
      this.pdfData.next(res);
      this.createPdfBlobUrl(res);
    });
  }

  private createPdfBlobUrl(data: Uint8Array | ArrayBuffer): void {
    const blob = new Blob([data], { type: 'application/pdf' });

    // Use the DomSanitizer to create a safe URL
    this.pdfURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }
}
