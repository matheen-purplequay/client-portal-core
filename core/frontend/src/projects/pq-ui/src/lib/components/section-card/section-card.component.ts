import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'pq-section-card',
  templateUrl: './section-card.component.html',
  styleUrls: ['./section-card.component.scss']
})
export class SectionCardComponent implements OnInit, AfterViewInit {

  @Input() sectionID: string = 'section';
  @Input() containerClass: string = '';
  @Input() rowClass: string = '';
  @Input() colClass: string = '';
  @Input() cardClass: string = '';
  @Input() cardHeaderClass: string = '';
  @Input() cardBodyClass: string = '';
  @Input() cardFooterClass: string = '';
  @Input() actionClass: string = '';
  @Input() clipContents: boolean = true;
  @Input() enableSettings: boolean = true;
  @Input() disableBody: boolean = false;
  @Input() disableActions: boolean = false;
  @Input() disableContainer: boolean = false;
  @Input() emptyBody: boolean = false;
  @Input() borderless: boolean = true;

  @Input() sectionTitle: string = '';
  @Input() sectionSubtitle: string =  '';

  @Input() verticalMargin: "default" | "none" | "small" | "large" = "default";
  @Input() showLoading: boolean  = false;
  @Input() showLoadingText: string = 'Loading...';
  @Input() fluidContainer: boolean = false;

  _containerClassess = ['section-card-container'];
  _verticalMarginClasses = {
    default: ['py-3'],
    small: ['py-1'],
    large: ['py-5'],
    none: ['py-0']
  };

  @Input() isPageRefreshRequired: boolean = false;

  constructor() { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.containerClass = `${this._containerClassess.join(' ')} ${this._verticalMarginClasses[this.verticalMargin].join(' ')} ${this.containerClass} ${(this.disableContainer)? 'disabled' : ''} ${(this.fluidContainer)? 'container-fluid' : 'container'}`;
    this.cardClass = `${(this.clipContents)? 'overflow-hidden' : ''} ${(this.borderless)? 'border-0' : 'border'} ${this.cardClass}`;
  }

  reload() {
    window.location.reload();
  }

}
