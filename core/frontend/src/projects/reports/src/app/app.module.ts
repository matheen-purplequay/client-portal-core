import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { PqUiModule } from 'pq-ui';
import { SidebarComponent } from './layouts/sidebar/sidebar.component';
import { AlertbarComponent } from './layouts/alertbar/alertbar.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationMasterComponent } from './modules/authentication/authentication-master/authentication-master.component';
import { LoginFormComponent } from './modules/authentication/login-form/login-form.component';
import { SharedModule } from './shared/shared.module';
import { AngularDraggableModule } from 'angular2-draggable';
import { PusherService } from './services/app/notifications/pusher.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { MaintenanceModeComponent } from './layouts/maintenance-mode/maintenance-mode.component';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { PageTemplateComponent } from './layouts/page-template/page-template.component';
import { JobStatusQueriesComponent } from './modules/dashbaord/queries/job-status-queries/job-status-queries.component';

import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from "ng-recaptcha";

@NgModule({
  declarations: [
    AppComponent,
    MaintenanceModeComponent,
    PageTemplateComponent,
    JobStatusQueriesComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    RecaptchaV3Module,
    PqUiModule,
    HttpClientModule,
    AngularDraggableModule,
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
    PusherService,
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptcha_keys.site_key }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
