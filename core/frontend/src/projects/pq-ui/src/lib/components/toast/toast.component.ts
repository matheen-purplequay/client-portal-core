import { Component, Input, OnInit } from '@angular/core';
import { ToastService } from '../../services/notifications/toast.service';

@Component({
  selector: 'pq-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {

  @Input() toastType: string | undefined;
  @Input() message: string | undefined = '';
  @Input() title: string | undefined = "";
  showCopy: boolean = false;
  dismissable: boolean = false;
  maxSeconds: number = 10;
  toastTypes: {
    [key: string]: {
      name: string,
      icon: string,
      class: string
    }
  } = {
      error: {
        name: "error",
        icon: '/assets/vectors/error.svg',
        class: 'toast-error'
      },
      warning: {
        name: "warning",
        icon: '/assets/vectors/warning.svg',
        class: 'toast-warning'
      },
      success: {
        name: "success",
        icon: '/assets/vectors/success.svg',
        class: 'toast-success'
      },
      info: {
        name: "info",
        icon: '/assets/vectors/info.svg',
        class: 'toast-info'
      },
      default: {
        name: "default",
        icon: '/assets/vectors/info.svg',
        class: 'toast-default'
      }
    };
  isUserLoggedIn: boolean = false;
  toastTitle: string | undefined = '';
  toastMessage: string | undefined = '';
  beforCopyText = "<div class='small text-center'><div><i class='fa-solid fa-copy'></i></div><div>Copy</div></div>";
  copiedText = "<div class='small text-center'><div><i class='fa-solid fa-copy'></i></div><div>Copied</div></div>";
  copyText = this.beforCopyText;

  constructor(private toastService: ToastService) {

  }

  ngOnInit() {
    this.toastService.toastState$.subscribe(message => {
      this.message = message?.message;
      this.title = message?.title;
      this.toastType = message?.type;
      this.dismissable = message.dismissable;
      this.maxSeconds = message.maxSeconds;
      this.showCopy = message.showCopy;
      if(this.dismissable) {
        setTimeout(()=>{
          this.dismissToast();
        }, this.maxSeconds * 1000);
      }
    });
  }

  ngAfterViewInit() {
  }

  copyBody(message: string) {
    navigator.clipboard.writeText(message);
    this.copyText = this.copiedText;
  }

  dismissToast() {
    this.message = "";
  }

}
