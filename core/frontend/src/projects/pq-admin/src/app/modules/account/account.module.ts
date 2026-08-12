import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { AccountMasterComponent } from './account-master/account-master.component';
import { PqUiModule } from 'pq-ui';
import { SharedModule } from '../shared/shared.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxImageCompressService } from 'ngx-image-compress';


@NgModule({
  declarations: [
    MyProfileComponent,
    AccountMasterComponent
  ],
  imports: [
    CommonModule,
    PqUiModule,
    SharedModule,
    ImageCropperModule,
    AccountRoutingModule
  ],
  providers: [NgxImageCompressService]
})
export class AccountModule { }
