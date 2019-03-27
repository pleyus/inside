import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { CurrencyMaskModule } from 'ng2-currency-mask';
import { ChartsModule } from 'ng2-charts';

import { Tools, Configuration } from './app.service';
import { WebService } from './services/web-service';
import { ConfigService } from './services/config.service';

import { AppComponent } from './app.component';
import { ApplicantsListComponent } from './difusion/list/list.component';
import { ApplicantsOpenComponent } from './difusion/open/open.component';
import { PaymentListComponent } from './payment/list/list.component';
import { PaymentOpenComponent } from './payment/open/open.component';
import { HomeComponent } from './home/home.component';
import { FeedbackListComponent } from './feedback/main/main.component';
import { UsersListComponent } from './users/list/list.component';
import { CategoriesListComponent } from './categories/list.component';
import { CategoriesOpenComponent } from './categories/open/open.component';
import { UsersOpenComponent } from './users/open/open.component';
import { RadioComponent } from './radio/radio.component';
import { RadioMessagesComponent } from './radio/messages/messages.component';
import { RadioGuideEditorComponent } from './radio/guide/editor/editor.component';
import { RadioGuideListComponent } from './radio/guide/list/list.component';
import { RadioAnnouncersComponent } from './radio/announcers/announcers.component';
import { CategoryInstitutionsComponent } from './categories/institutions/institutions.component';
import { UsersMeComponent } from './users/me/me.component';
import { LibraryComponent } from './library/library.component';
import { HeaderComponent } from './core/header/header.component';
import { LinkerComponent } from './core/linker/linker.component';
import { UsersNormalViewComponent } from './users/list/view-normal/view-normal.component';
import { UsersContactsViewComponent } from './users/list/view-contacts/view-contacts.component';
import { AdminComponent } from './library/admin/admin.component';
import { MessagesComponent } from './messages/messages.component';
import { ApplicantsComponent } from './difusion/difusion.component';
import { ApplicantsStatsComponent } from './difusion/stats/stats.component';
import { LoginComponent } from './core/login/login.component';
import { CodersdayComponent } from './core/holidays/codersday/codersday.component';
import { HappyBirthdayComponent } from './core/holidays/happy-birthday/happy-birthday.component';
import { ScriptHackComponent } from './core/script-hack/script-hack.component';
import { AcademyComponent } from './academy/academy.component';
import { CheckinComponent } from './academy/checkin/checkin.component';
import { ViasComponent } from './difusion/vias/vias.component';
import { HolidaysComponent } from './core/holidays/holidays.component';
import { FileManagerComponent } from './core/file-manager/file-manager.component';
import { StatusComponent } from './core/status/status.component';
import { StatusService, InsideListenerService } from './services/status.service';
import { PollComponent } from './poll/poll.component';
import { PollOpenComponent } from './poll/open/open.component';

const appRoutes: Routes = [
  {
    path: 'difusion',
    component: ApplicantsComponent,
    children: [
      { path: '', redirectTo: 'applicants', pathMatch: 'full' },
      { path: 'applicants', component: ApplicantsListComponent },
      { path: 'stats', component: ApplicantsStatsComponent },
      { path: 'vias', component: ViasComponent },
      { path: 'inbox', component: MessagesComponent },
      { path: 'applicants/:id', component: ApplicantsOpenComponent }
    ]
  },
  {
    path: 'academy',
    component: AcademyComponent,
    children: [
      { path: '', redirectTo: 'checkin', pathMatch: 'full' },
      { path: 'checkin', component: CheckinComponent }
    ]
  },

  { path: 'poll', component: PollComponent },
  { path: 'poll/:id', component: PollOpenComponent },

  { path: 'payment', component: PaymentListComponent },
  { path: 'payment/:id', component: PaymentOpenComponent },
  { path: 'payment/:id/:uid', component: PaymentOpenComponent },

  {
    path: 'categories',
    component: CategoriesListComponent,
    children: [
      { path: '', redirectTo: 'courses', pathMatch: 'full' },
      { path: 'institution', component: CategoryInstitutionsComponent },
      { path: ':open', component: CategoriesOpenComponent }
    ]
  },

  //  Users Module
  { path: 'me', component: UsersMeComponent },
  { path: 'users', component: UsersListComponent },
  { path: 'users/:uid', component: UsersOpenComponent },

  {
    path: 'radio',
    component: RadioComponent,
    children: [
      { path: '', redirectTo: 'messages', pathMatch: 'full' },
      { path: 'messages', component: RadioMessagesComponent },
      { path: 'announcers', component: RadioAnnouncersComponent },
      { path: 'guide', component: RadioGuideListComponent },
      { path: 'guide/:id', component: RadioGuideEditorComponent }
    ]
  },

  // { path: 'login', component: LoginComponent },

  { path: 'feedback', component: FeedbackListComponent },
  { path: 'home', component: HomeComponent },

  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    ApplicantsListComponent,
    ApplicantsOpenComponent,
    PaymentListComponent,
    PaymentOpenComponent,
    HomeComponent,
    FeedbackListComponent,
    UsersListComponent,
    CategoriesListComponent,
    CategoriesOpenComponent,
    UsersOpenComponent,
    RadioComponent,
    RadioMessagesComponent,
    RadioGuideEditorComponent,
    RadioGuideListComponent,
    RadioAnnouncersComponent,
    CategoryInstitutionsComponent,
    UsersMeComponent,
    LibraryComponent,
    HeaderComponent,
    LinkerComponent,
    UsersNormalViewComponent,
    UsersContactsViewComponent,
    AdminComponent,
    MessagesComponent,
    ApplicantsComponent,
    ApplicantsStatsComponent,
    LoginComponent,
    CodersdayComponent,
    HappyBirthdayComponent,
    ScriptHackComponent,
    AcademyComponent,
    CheckinComponent,
    ViasComponent,
    HolidaysComponent,
    FileManagerComponent,
    StatusComponent,
    PollComponent,
    PollOpenComponent
  ],

  imports: [
    RouterModule.forRoot( appRoutes ),
    BrowserModule,
    HttpClientModule,
    FormsModule,
    CurrencyMaskModule,
    ChartsModule,
    CKEditorModule
  ],
  providers: [ StatusService, InsideListenerService, WebService, ConfigService, Tools, Configuration ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
