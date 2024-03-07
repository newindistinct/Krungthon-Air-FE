import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkGroupPageRoutingModule } from './work-group-routing.module';

import { WorkGroupPage } from './work-group.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkGroupPageRoutingModule
  ],
  declarations: [WorkGroupPage]
})
export class WorkGroupPageModule {}
