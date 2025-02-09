import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Customer, ServiceRecord } from 'src/app/services/customer.service';

@Component({
  selector: 'app-confirm-save-modal',
  template: `
    <ion-content class="ion-padding-top">
      <div class="flex flex-col h-full max-w-md mx-auto">
        <!-- Header -->
        <div class="text-center px-4 mb-4">
          <h2 class="text-xl font-semibold text-gray-800">ตรวจสอบข้อมูล</h2>
          <p class="text-sm text-gray-500 mt-1">กรุณาตรวจสอบความถูกต้อง</p>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto px-4">
          <!-- Customer Info -->
          <div class="bg-blue-50 rounded-xl p-4 mb-4">
            <div class="flex items-center gap-2 mb-3">
              <ion-icon name="person-outline" class="text-blue-600"></ion-icon>
              <h3 class="text-base font-medium text-blue-800">ข้อมูลลูกค้า</h3>
            </div>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <ion-icon name="person" class="text-gray-400 text-lg"></ion-icon>
                <span>{{ customer.firstName }} {{ customer.lastName }}</span>
              </div>
              <div class="flex items-center gap-2">
                <ion-icon name="business" class="text-gray-400 text-lg"></ion-icon>
                <span>{{ customer.condoName }}</span>
              </div>
              <div class="flex items-center gap-2">
                <ion-icon name="location" class="text-gray-400 text-lg"></ion-icon>
                <span>อาคาร {{ customer.building }} ชั้น {{ customer.floor }} ห้อง {{ customer.room }}</span>
              </div>
            </div>
          </div>

          <!-- Services List -->
          <div class="space-y-3 mb-4">
            <div class="flex items-center gap-2">
              <ion-icon name="snow" class="text-primary"></ion-icon>
              <h3 class="text-base font-medium text-gray-800">
                รายการแอร์ ({{ services.length }} เครื่อง)
              </h3>
            </div>
            <div class="space-y-2">
              <div *ngFor="let service of services; let i = index" 
                   class="bg-gray-50 rounded-xl p-4">
                <div class="flex items-center gap-2 text-primary font-medium mb-2">
                  <span class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                    {{i + 1}}
                  </span>
                  <span>{{ service.brand }}</span>
                </div>
                <div class="ml-8 space-y-1 text-sm text-gray-600">
                  <p class="flex items-center gap-2">
                    <ion-icon name="thermometer-outline" class="text-gray-400"></ion-icon>
                    {{ service.btu }}
                  </p>
                  <p class="flex items-center gap-2">
                    <ion-icon name="time-outline" class="text-gray-400"></ion-icon>
                    {{ service.age }}
                  </p>
                  <p class="flex items-center gap-2">
                    <ion-icon name="home-outline" class="text-gray-400"></ion-icon>
                    {{ getRoomTypeName(service.roomType) }}
                  </p>
                  <p class="flex items-center gap-2">
                    <ion-icon name="cash-outline" class="text-gray-400"></ion-icon>
                    {{ service.contractAmount | number }} บาท
                  </p>
                  <p *ngIf="service.note" class="flex items-center gap-2">
                    <ion-icon name="document-text-outline" class="text-gray-400"></ion-icon>
                    {{ service.note }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fixed Bottom Buttons -->
        <div class="sticky bottom-0 bg-white border-t px-4 py-3 space-y-2">
          <ion-button 
            expand="block"
            class="font-medium shadow-md"
            (click)="confirmSave()"
          >
            <ion-icon name="save-outline" slot="start"></ion-icon>
            บันทึกข้อมูล
          </ion-button>
          <ion-button 
            expand="block"
            fill="clear"
            class="font-medium"
            (click)="dismiss()"
          >
            แก้ไข
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
export class ConfirmSaveModalComponent {
  @Input() customer!: Customer;
  @Input() services!: ServiceRecord[];

  constructor(private modalCtrl: ModalController) {}

  getRoomTypeName(roomType: string): string {
    const types: { [key: string]: string } = {
      bedroom: 'ห้องนอน',
      living: 'ห้องรับแขก',
      kitchen: 'ห้องครัว',
      other: 'อื่นๆ',
    };
    return types[roomType] || roomType;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  confirmSave() {
    this.modalCtrl.dismiss({ confirmed: true });
  }
} 