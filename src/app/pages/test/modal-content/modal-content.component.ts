import { Component, OnInit } from '@angular/core';
import { IonNav, ModalController, Platform } from '@ionic/angular';
import { SettingComponent } from '../../setting/setting.component';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.scss'],
})
export class ModalContentComponent implements OnInit {
  level = 0;
  nextPage = ModalContentComponent;

  constructor(private modalController: ModalController, private nav: IonNav, private platform: Platform) {
    this.platform.backButton.subscribeWithPriority(101, async () => {
      let canGoBack = await this.nav.canGoBack();
      if (canGoBack) {
        this.nav.pop();
      } else {
        await this.modalController.dismiss();
      }
      return;
    });
  }
  ngOnInit() { }

  goForward() {
    this.nav.push(this.nextPage, { level: this.level + 1 });
  }

  goRoot() {
    this.nav.popToRoot();
  }

  close() {
    this.modalController.dismiss();
  }
}
