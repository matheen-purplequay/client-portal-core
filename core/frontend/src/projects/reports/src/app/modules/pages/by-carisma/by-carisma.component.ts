import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../../../services/app/config.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

@Component({
  selector: 'app-by-carisma',
  templateUrl: './by-carisma.component.html',
  styleUrls: ['./by-carisma.component.scss']
})
export class ByCarismaComponent implements OnInit, AfterViewInit {
  
  @ViewChild('pdf') iframeRef: any;

  links:any
  link: any;

  carimsaPDF: string = '/assets/pdfs/carisma-deck.pdf';
  purplequayPDF: string = '/assets/pdfs/purplequay-deck.pdf';

  pdfLink = this.carimsaPDF;
  pdfURL: SafeUrl =  '';
  pdfData: BehaviorSubject<Uint8Array | ArrayBuffer | undefined> = new BehaviorSubject<Uint8Array | ArrayBuffer | undefined>(undefined);

  master_company: any;
  master_company_short_name: string = 'cs';

  constructor(
    private configService: ConfigService,
    private localStorageService: LocalStorageService,
    private sanitizer: DomSanitizer
  ) { 
    
  }
  
  ngOnInit(): void {
    this.pdfURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfLink);

    const url = window.location.href;

    if(this.localStorageService.getItem('userdata').master_company)
      this.master_company = this.localStorageService.getItem('userdata').master_company;
    
    if(url.includes('purplequay.com.au')) {
      this.master_company_short_name = 'pq';
      this.pdfLink = this.purplequayPDF;
      this.pdfURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfLink);
    }

    this.configService.getJSONData('externallinks').subscribe((res: any) => {
      this.links = res;
      this.link = this.links[this.master_company_short_name.toLowerCase()];
      console.log('this.master_company.short_name ', this.master_company.short_name.toLowerCase(), this.link);
    });
  }

  ngAfterViewInit(): void {
      // this.adjustIframeHeight();
  }

  adjustIframeHeight() {
    if (this.iframeRef && this.iframeRef.nativeElement) {
      const iframe = this.iframeRef.nativeElement;
      const contentHeight = iframe.contentWindow ? iframe.contentWindow.document.body.scrollHeight : iframe.document.body.offsetHeight;
      iframe.style.height = contentHeight + 'px';
      console.log('iframe height ', iframe.style.height, iframe.contentWindow.document.body.scrollHeight, iframe.document.body.offsetHeight);
    }
  }

}
