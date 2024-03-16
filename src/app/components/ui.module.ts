import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from '../app-routing.module';
import { AddJobComponent } from '../pages/work-group/add-job/add-job.component';
import { LayoutsModule } from './layouts/layouts.module';
import { InputComponent } from './forms/input/input.component';
import { SelectComponent } from './forms/select/select.component';
import { SettingAddComponent } from './modals/setting-add/setting-add.component';



@NgModule({
  declarations: [
    InputComponent,
    SelectComponent,
    SettingAddComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutsModule,
    AppRoutingModule
  ],
  exports: [
    InputComponent,
    SelectComponent
  ]
})
export class UiModule { }
