import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Activities, Activity } from '../../../models/activities';
import { ToastService } from 'pq-ui';
import { CommonService } from '../../../services/common/common.service';

@Component({
  selector: 'app-contact-recipients',
  templateUrl: './contact-recipients.component.html',
  styleUrls: ['./contact-recipients.component.scss']
})
export class ContactRecipientsComponent implements OnInit {

  @Output() dismissEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() activityChangedEvent: EventEmitter<number> = new EventEmitter();
  @Input() refresh: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() selectedClient: BehaviorSubject<{ works_manager_client_id: number; name: string; }> = new BehaviorSubject({ works_manager_client_id: 0, name: '' });

  // state variable
  activity: { list: Activities, current: number } = {
    list: Activity.defaultActivities(),
    current: Activity.defaultActivity()
  };

  recipients: {
    id: number;
    client_id: number;
    form_type: string;
    email_to: string;
    email_cc: string;
  } = {
    id: 0,
    client_id: 0,
    form_type: "",
    email_to: "",
    email_cc: "",
  };
  isRecipientsSaving: boolean = false;
  isRecipientsLoading: boolean = false;

  // common variables
  period: { 
    years: number[],
    monthNames: string[],
    selectedPeriod: { date: number, month: number, year: number }
  } = {
    years: [2023],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selectedPeriod: { date: new Date().getDate(), month: 0, year: new Date().getFullYear() }
  };

  constructor(
    private commonService: CommonService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.getRecipients();
  }

  resetRecipients() {
    this.recipients = {
      id: 0,
      client_id: 0,
      form_type: "",
      email_to: "",
      email_cc: ""
    };
  }

  getRecipients() {
    this.isRecipientsLoading = true;
    const body = {
      client_id: this.selectedClient.value.works_manager_client_id,
      form_type: 'contact'
    };
    this.commonService.getContactFormRecepients(body).subscribe((res: any) => {
      this.isRecipientsLoading = false;
      console.log('recipients loading ', this.selectedClient.value);
      if(res.status && res.data) this.recipients = res.data;
    });
  }

  saveRecipients() {
    this.isRecipientsSaving = true;
    this.recipients.client_id = this.selectedClient.value.works_manager_client_id;
    this.commonService.saveContactFormRecipients(this.recipients).subscribe((res: any) => {
      this.isRecipientsSaving = false;
      if(res.status) {
        this.toastService.show('Email recipients saved', 'Saved', 'success', true);
        this.resetRecipients();
        this.getRecipients();
      }
    });
  }

  toNumber = (value: string) => { return parseInt(value); }

  dismiss() {
    this.dismissEvent.emit(true);
  }

}
