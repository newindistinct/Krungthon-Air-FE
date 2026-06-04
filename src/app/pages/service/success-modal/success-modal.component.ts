import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-success-modal',
  template: `
    <ion-content class="ion-padding">
      <div class="flex flex-col items-center justify-center min-h-full">
        <!-- Icon Success -->
        <div class="w-24 h-24 mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <ion-icon 
            name="checkmark-circle" 
            class="text-6xl text-green-500"
          ></ion-icon>
        </div>

        <!-- Content -->
        <div class="text-center space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">
            บันทึกข้อมูลสำเร็จ
          </h2>
          <div class="space-y-2">
            <p class="text-gray-600">รหัสลูกค้าของคุณคือ</p>
            <div class="bg-gray-50 rounded-lg py-3 px-6 inline-block">
              <p class="text-2xl font-mono font-bold text-primary">
                {{ customerId }}
              </p>
            </div>
          </div>
          <p class="text-sm text-gray-500">
            กรุณาจดจำรหัสลูกค้าเพื่อใช้ในการติดต่อครั้งต่อไป
          </p>
        </div>

        <!-- Button -->
        <div class="mt-8 w-full">
          <ion-button 
            expand="block" 
            class="font-medium"
            (click)="dismiss()"
          >
            <ion-icon name="checkmark-outline" slot="start"></ion-icon>
            ตกลง
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      --min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    ion-content {
      --background: white;
    }
    .text-primary {
      color: var(--ion-color-primary);
    }
    ion-button {
      --padding-top: 1rem;
      --padding-bottom: 1rem;
    }
  `]
})
export class SuccessModalComponent {
  @Input() customerId!: string;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
} 