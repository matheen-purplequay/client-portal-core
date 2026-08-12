import { NgModule } from '@angular/core';
import { PqUiComponent } from './pq-ui.component';
import { TextboxComponent } from './atoms/textbox/textbox.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { InlineAlertComponent } from './atoms/inline-alert/inline-alert.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ButtonComponent } from './atoms/button/button.component';
import { RouterModule } from '@angular/router';
import { SimpleTabComponent } from './atoms/simple-tab/simple-tab.component';
import { SectionCardComponent } from './components/section-card/section-card.component';
import { ChartsComponent } from './components/charts/charts.component';
import { DropdownComponent } from './atoms/dropdown/dropdown.component';
import { ToastComponent } from './components/toast/toast.component';
import { ToggleSwitchComponent } from './atoms/toggle-switch/toggle-switch.component';
import { SimpleHorizontalLoadingComponent } from './components/simple-horizontal-loading/simple-horizontal-loading.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SimpleTimeLoadingComponent } from './components/simple-time-loading/simple-time-loading.component';

@NgModule({
  declarations: [
    PqUiComponent,
    TextboxComponent,
    InlineAlertComponent,
    ButtonComponent,
    SimpleTabComponent,
    SectionCardComponent,
    ChartsComponent,
    DropdownComponent,
    ToastComponent,
    ToggleSwitchComponent,
    SimpleHorizontalLoadingComponent,
    PaginationComponent,
    SimpleTimeLoadingComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    NgxPaginationModule,
    FormsModule
  ],
  exports: [
    PqUiComponent,
    TextboxComponent,
    InlineAlertComponent,
    ButtonComponent,
    SimpleTabComponent,
    SectionCardComponent,
    ChartsComponent,
    DropdownComponent,
    ToastComponent,
    ToggleSwitchComponent,
    SimpleHorizontalLoadingComponent,
    PaginationComponent,
    SimpleTimeLoadingComponent
  ]
})
export class PqUiModule { }
