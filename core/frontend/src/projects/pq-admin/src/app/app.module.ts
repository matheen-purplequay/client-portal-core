import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PqUiModule } from 'pq-ui';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationMasterComponent } from './modules/authentication/authentication-master/authentication-master.component';
import { LoginComponent } from './modules/authentication/login/login.component';
import { TitleCasePipe } from '@angular/common';
import { CenterSlideButtonComponent } from './components/center-slide-button/center-slide-button.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';

import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from "ng-recaptcha";

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationMasterComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    PqUiModule,
    HttpClientModule,
    RecaptchaV3Module,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireMessagingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    TitleCasePipe,
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptcha_keys.site_key }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
