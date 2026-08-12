import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { NavbarComponent } from '../layouts/navbar/navbar.component';
import { SidebarComponent } from '../layouts/sidebar/sidebar.component';
import { AlertbarComponent } from '../layouts/alertbar/alertbar.component';
import { VerticalsDropdownComponent } from './components/verticals-dropdown/verticals-dropdown.component';
import { PqUiModule } from 'pq-ui';
import { HtmlFrameComponent } from './components/html-frame/html-frame.component';
import { ContactComponent } from '../modules/account/contact/contact.component';
import { FormsModule } from '@angular/forms';
import { CommentsComponent } from './components/comments/comments.component';
import { ObjectFilterPipe } from './pipes/object-filter.pipe';
import { NetworkLoaderComponent } from './components/network-loader/network-loader.component';
import { TipsPopupComponent } from './components/tips-popup/tips-popup.component';
import { PaginationTemplateComponent } from './components/pagination-template/pagination-template.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarEventsComponent } from './components/calendar-events/calendar-events.component';

@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    AlertbarComponent,
    VerticalsDropdownComponent,
    HtmlFrameComponent,
    ContactComponent,
    CommentsComponent,
    ObjectFilterPipe,
    NetworkLoaderComponent,
    TipsPopupComponent,
    PaginationTemplateComponent,
    CalendarEventsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PqUiModule,
    NgxPaginationModule,
  ],
  exports: [
    NavbarComponent,
    SidebarComponent,
    AlertbarComponent,
    VerticalsDropdownComponent,
    HtmlFrameComponent,
    ContactComponent,
    CommentsComponent,
    ObjectFilterPipe,
    NetworkLoaderComponent,
    TipsPopupComponent,
    PaginationTemplateComponent,
    CalendarEventsComponent
  ],
  providers: [TitleCasePipe]
})
export class SharedModule { }
