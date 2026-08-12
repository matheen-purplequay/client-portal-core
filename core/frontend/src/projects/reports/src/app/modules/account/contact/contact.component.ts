import { Component, Input, OnInit } from '@angular/core';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { AccountService } from '../../../services/account/account.service';
import { ToastService } from 'pq-ui';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  @Input() isEmbedded: boolean = false;
  @Input() query: string = '';
  @Input() title: string = 'General query';
  @Input() subtitle: string = 'Please note that your message will be directed to our Client Lead and Delivery Head.';

  email: string = '';
  name: string = '';
  
  isSendingQuery: boolean = false;
  isMessageSent: boolean = false;

  constructor(
    private localStorageService: LocalStorageService,
    private accountService: AccountService,
    private toastService: ToastService
  ) { 
    this.email = this.localStorageService.getItem('userdata').email;
    this.name = 
      `${this.localStorageService.getItem('userdata').first_name} ${this.localStorageService.getItem('userdata').last_name}`;
  }

  ngOnInit(): void {
  }

  sendMessage() {
    this.isSendingQuery = true;
    let body = {
      email: this.email,
      name: this.name,
      query: this.query,
      client_id: this.localStorageService.getItem('userdata').company_id,
      date: `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}`
    };
    this.accountService.sendMessage(body).subscribe((res: any) => {
      this.isSendingQuery = false;
      this.isMessageSent = true;
      console.log(res);
      if(res.status) {
        setTimeout(() => {
          this.isMessageSent = false;
        }, 7000);
        this.toastService.show('Your message has been sent.', 'Message sent', 'success', true);
        this.query = '';
      }
      else this.toastService.show('Something went wrong. Please try again.', 'Something wrong', 'error', true);
    });
  }

}
