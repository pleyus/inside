import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CurrencyMaskModule } from 'ng2-currency-mask';
import { ChartsModule } from 'ng2-charts';

import { Tools, WebService, AppStatus, Configuration } from './app.service';

import { AppComponent } from './app.component';
import { ApplicantsListComponent } from './applicants/list/list.component';
import { ApplicantsOpenComponent } from './applicants/open/open.component';
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
import {   RadioAnnouncersComponent } from './radio/announcers/announcers.component';
import { CategoryInstitutionsComponent } from './categories/institutions/institutions.component';
import { UsersMeComponent } from './users/me/me.component';
import { LibraryComponent } from './library/library.component';
import { HeaderComponent } from './core/header/header.component';
import { MenuComponent } from './core/menu/menu.component';
import { LinkerComponent } from './core/linker/linker.component';
import { UsersNormalViewComponent } from './users/list/view-normal/view-normal.component';
import { UsersContactsViewComponent } from './users/list/view-contacts/view-contacts.component';
import { AdminComponent } from './library/admin/admin.component';
import { MessagesComponent } from './messages/messages.component';
import { ApplicantsComponent } from './applicants/applicants.component';
import { ApplicantsStatsComponent } from './applicants/stats/stats.component';
import { LoginComponent } from './core/login/login.component';

const appRoutes: Routes = [
  {
    path: 'applicants',
    component: ApplicantsComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: ApplicantsListComponent },
      { path: 'stats', component: ApplicantsStatsComponent },
      { path: ':id', component: ApplicantsOpenComponent }
    ]
  },

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

  { path: 'inbox', component: MessagesComponent },
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
    MenuComponent,
    LinkerComponent,
    UsersNormalViewComponent,
    UsersContactsViewComponent,
    AdminComponent,
    MessagesComponent,
    ApplicantsComponent,
    ApplicantsStatsComponent,
    LoginComponent
  ],

  imports: [
    RouterModule.forRoot( appRoutes ),
    BrowserModule,
    HttpClientModule,
    FormsModule,
    CurrencyMaskModule,
    ChartsModule
  ],
  providers: [ WebService, Tools, AppStatus, Configuration],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
