import { Component, OnInit } from '@angular/core';
import { SharedComponentsModule } from '../shared-components.module';
import { IonHeader } from "@ionic/angular/standalone";
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { ModalBaseComponent } from '../modal-base/modal-base.component';
import { ModalContentComponent } from '../modal-content/modal-content.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeTestComponent implements OnInit {
  constructor(
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet
  ) { }

  ngOnInit() { }

  async presentModal() {
    const modal = await this.modalController.create({
      presentingElement: this.routerOutlet.nativeEl,
      component: ModalBaseComponent,
      componentProps: {
        rootPage: ModalContentComponent,
      },
    });

    await modal.present();
  }
}
