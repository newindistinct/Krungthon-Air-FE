import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JobSchedulePageRoutingModule } from './job-schedule-routing.module';

import { JobSchedulePage } from './job-schedule.page';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { provideNativeDateAdapter } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxDatatableModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    JobSchedulePageRoutingModule
  ],
  providers: [provideNativeDateAdapter()],
  declarations: [JobSchedulePage]
})
export class JobSchedulePageModule { }
