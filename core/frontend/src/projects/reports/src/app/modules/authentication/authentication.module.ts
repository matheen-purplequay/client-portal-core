import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { PqUiModule } from 'pq-ui';
import { HttpClientModule } from '@angular/common/http';
import { OtpFormComponent } from './otp-form/otp-form.component';
import { AuthenticationMasterComponent } from './authentication-master/authentication-master.component';
import { LoginFormComponent } from './login-form/login-form.component';

@NgModule({
  declarations: [
    AuthenticationMasterComponent,
    LoginFormComponent,
    OtpFormComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PqUiModule,
    AuthenticationRoutingModule
  ],
})
export class AuthenticationModule { }
