import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  loading: any;
  loading2: any;
  constructor(private loadingController: LoadingController,
    private alert: AlertController) { }
  async presentLoadingWithOutTime(massage: string) {
    this.loading = await this.loadingController.create({
      message: massage,
    });
    await this.loading.present();
  }

  //loading Cancel
  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  } 
  async presentLoadingWithOutTime2(massage: string) {
    this.loading2 = await this.loadingController.create({
      message: massage,
    });
    await this.loading2.present();
  }

  //loading Cancel
  async dismissLoading2() {
    if (this.loading2) {
      await this.loading2.dismiss();
    }
  }

  //alertPresent
  AlertPresent(header: string, message: string) {
    this.alert.create({
      header: header,
      message: message,
      buttons: [
        // {
        //   text: 'ยกเลิก',
        //   role: 'cancel',
        // },
        {
          text: 'ตกลง',
          handler: () => {
          }
        }
      ]
    }).then(alert => {
      alert.present();
    });
  }
  async showAlert(header: string, message: string, handler: Function, options?: {
    confirm?: string,
    confirmOnly?: boolean,
    cssStyle?: string,
  }, handlerCancel?: Function) {
    let buttons = []
    if (options?.confirmOnly) {
      buttons = [
        {
          text: 'ตกลง',
          role: 'confirm',
          cssClass: "confirm-button",
          handler: async () => {
            if (handler) {
              handler();
            }
          },
        }
      ]
    } else {
      buttons = [
        {
          text: 'ยกเลิก',
          role: 'cancel',
          // cssClass: "cancel-button",
          handler: async () => {
            if (handlerCancel) {
              handlerCancel();
            }
          },

        }, {
          text: options?.confirm || 'ยืนยัน',
          role: 'confirm',
          cssClass: "confirm-button",
          handler: async () => {
            if (handler) {
              handler();
            }
          },
        }
      ]
    }
    const alert = await this.alert.create({
      mode: "ios",
      header: header,
      message: message,
      buttons: buttons,
      // cssClass: options?.cssStyle || "alert-screen"
    })
    alert.present();
  }
}
