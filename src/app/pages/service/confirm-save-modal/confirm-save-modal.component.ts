import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Customer, ServiceRecord } from 'src/app/services/customer.service';

@Component({
  selector: 'app-confirm-save-modal',
  template: `
    <ion-content class="ion-padding">
      <div class="flex flex-col min-h-full">
        <!-- Header -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-800">ยืนยันข้อมูล</h2>
          <p class="text-gray-500 mt-2">กรุณาตรวจสอบความถูกต้องของข้อมูล</p>
        </div>

        <!-- Customer Info -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-medium text-blue-800 mb-3">ข้อมูลลูกค้า</h3>
          <div class="space-y-2 text-gray-600">
            <p>ชื่อ-นามสกุล: <span class="font-medium">{{ customer.firstName }} {{ customer.lastName }}</span></p>
            <p>ที่อยู่: <span class="font-medium">{{ customer.condoName }}</span></p>
            <p>อาคาร: <span class="font-medium">{{ customer.building }}</span> 
               ชั้น: <span class="font-medium">{{ customer.floor }}</span> 
               ห้อง: <span class="font-medium">{{ customer.room }}</span></p>
          </div>
        </div>

        <!-- Services List -->
        <div class="flex-1 overflow-auto">
          <h3 class="text-lg font-medium text-gray-800 mb-3">
            รายการแอร์ ({{ services.length }} เครื่อง)
          </h3>
          <div class="space-y-3">
            <div *ngFor="let service of services; let i = index" 
                 class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center gap-2 text-primary font-medium mb-2">
                <ion-icon name="snow-outline"></ion-icon>
                <span>{{ i + 1 }}. {{ service.brand }}</span>
              </div>
              <div class="ml-6 space-y-1 text-gray-600">
                <p>• ขนาด: {{ service.btu }}</p>
                <p>• อายุเครื่อง: {{ service.age }}</p>
                <p>• ประเภทห้อง: {{ getRoomTypeName(service.roomType) }}</p>
                <p>• วงเงินสัญญา: {{ service.contractAmount | number }} บาท</p>
                <p *ngIf="service.note">• หมายเหตุ: {{ service.note }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="mt-6 space-y-3">
          <ion-button 
            expand="block"
            class="font-medium"
            (click)="confirmSave()"
          >
            <ion-icon name="save-outline" slot="start"></ion-icon>
            บันทึกข้อมูล
          </ion-button>
          <ion-button 
            expand="block"
            fill="outline"
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