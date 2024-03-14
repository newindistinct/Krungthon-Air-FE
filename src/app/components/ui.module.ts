import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from '../app-routing.module';
import { AddJobComponent } from '../pages/add-job/add-job.component';
import { LayoutsModule } from './layouts/layouts.module';
import { InputComponent } from './forms/input/input.component';



@NgModule({
  declarations: [
    InputComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AppRoutingModule
  ],
  exports: [
    InputComponent
  ]
})
export class UiModule { }
