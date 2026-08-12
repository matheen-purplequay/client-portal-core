import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-inline-attachment',
  templateUrl: './inline-attachment.component.html',
  styleUrls: ['./inline-attachment.component.scss']
})
export class InlineAttachmentComponent implements OnInit {

  @Output() cancelAttachment: EventEmitter<boolean> = new EventEmitter(false);
  @Output() addAttachment: EventEmitter<{ title: string, link: string }> = new EventEmitter();
  @Input() attachmentFor: "sending" | "receiving" = "sending";

  attachment: { title: string, link: string } = {
    title: '', link: ''
  };

  constructor() { }

  ngOnInit(): void {
  }

  cancelAttachmentProcess = () => this.cancelAttachment.emit(true);

  addAttachmentLink = () => {
    this.addAttachment.emit({ title: this.attachment.title, link: this.attachment.link });
    this.attachment.link = '';
    this.attachment.title = '';
  }

}
