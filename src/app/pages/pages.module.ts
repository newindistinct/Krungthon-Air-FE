import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LayoutsModule } from '../components/layouts/layouts.module';
import { UiModule } from '../components/ui.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { JobScheduleComponent } from './job-schedule/job-schedule.component';
import { JobsListComponent } from './jobs-list/jobs-list.component';
import { GroupComponent } from './setting/group/group.component';
import { JobComponent } from './setting/job/job.component';
import { SettingComponent } from './setting/setting.component';
import { SiteComponent } from './setting/site/site.component';
import { UserComponent } from './setting/user/user.component';
import { AddJobComponent } from './work-group/add-job/add-job.component';
import { WorkGroupComponent } from './work-group/work-group.component';



@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    JobScheduleComponent,
    SettingComponent,
    WorkGroupComponent,
    AddJobComponent,
    JobsListComponent,
    UserComponent,
    SiteComponent,
    GroupComponent,
    JobComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxDatatableModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    LayoutsModule,
    UiModule,
    ReactiveFormsModule
  ],
  exports: [
    DashboardComponent
  ],
  providers: [provideNativeDateAdapter()],
})
export class PagesModule { }
