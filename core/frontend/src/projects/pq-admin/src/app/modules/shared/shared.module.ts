import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FloatingSupportComponent } from '../../components/floating-support/floating-support.component';
import { PqUiModule } from 'pq-ui';
import { SlideButtonComponent } from '../../components/slide-button/slide-button.component';
import { CenterSlideButtonComponent } from '../../components/center-slide-button/center-slide-button.component';
import { ReportDetailsComponent } from './reports/report-details/report-details.component';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ObjectFilterPipe } from '../../utilities/tools/object-filter.pipe';
import { SimpleLoadingTextComponent } from '../../components/simple-loading-text/simple-loading-text.component';


@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    FloatingSupportComponent,
    SlideButtonComponent,
    CenterSlideButtonComponent,
    ReportDetailsComponent,
    ObjectFilterPipe,
    SimpleLoadingTextComponent
  ],
  imports: [
    CommonModule,
    CKEditorModule,
    FormsModule,
    PqUiModule
  ],
  exports: [
    NavbarComponent,
    SidebarComponent,
    FloatingSupportComponent,
    FormsModule,
    SlideButtonComponent,
    CenterSlideButtonComponent,
    ReportDetailsComponent,
    ObjectFilterPipe,
    SimpleLoadingTextComponent
  ],
  providers: [TitleCasePipe]
})
export class SharedModule { }
