import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-html-frame',
  templateUrl: './html-frame.component.html',
  styleUrls: ['./html-frame.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HtmlFrameComponent implements OnInit {

  @Input() htmlTemplate: string = '';
  htmlContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.htmlContent = this.setTrustedHtml(this.htmlTemplate);  
  }

  setTrustedHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}
