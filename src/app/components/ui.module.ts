import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from '../app-routing.module';
import { AddJobComponent } from '../pages/add-job/add-job.component';
import { LayoutsModule } from './layouts/layouts.module';



@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AppRoutingModule
  ],
  exports: [
    
  ]
})
export class UiModule { }
