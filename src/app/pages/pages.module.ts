import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutsModule } from '../components/layouts/layouts.module';
import { HomeComponent } from './home/home.component';
import { JobScheduleComponent } from './job-schedule/job-schedule.component';
import { SettingComponent } from './setting/setting.component';
import { UserComponent } from './user/user.component';
import { WorkGroupComponent } from './work-group/work-group.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AddJobComponent } from './add-job/add-job.component';
import { JobsListComponent } from './jobs-list/jobs-list.component';
import { UiModule } from '../components/ui.module';
import { AddGroupComponent } from './add-group/add-group.component';



@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    JobScheduleComponent,
    SettingComponent,
    UserComponent,
    WorkGroupComponent,
    AddJobComponent,
    JobsListComponent,
    AddGroupComponent
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
