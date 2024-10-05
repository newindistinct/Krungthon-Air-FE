import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalBaseComponent } from './modal-base/modal-base.component';
import { HomeTestComponent } from './home/home.component';
import { ModalContentComponent } from './modal-content/modal-content.component';



@NgModule({
  declarations: [ModalBaseComponent, ModalContentComponent, HomeTestComponent],
  imports: [CommonModule, IonicModule],
  exports: [ModalBaseComponent, ModalContentComponent, HomeTestComponent],
})
export class SharedComponentsModule { }
