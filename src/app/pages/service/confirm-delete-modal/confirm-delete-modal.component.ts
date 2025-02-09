import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ServiceRecord } from 'src/app/services/customer.service';

@Component({
  selector: 'app-confirm-delete-modal',
  template: `
    <ion-content class="ion-padding">
      <div class="flex flex-col items-center justify-center min-h-full">
        <!-- Icon Warning -->
        <div class="w-24 h-24 mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <ion-icon 
            name="warning-outline" 
            class="text-6xl text-red-500"
          ></ion-icon>
        </div>

        <!-- Content -->
        <div class="text-center space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">
            ยืนยันการลบรายการ
          </h2>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            <p class="text-gray-600">ยี่ห้อ: <span class="font-medium">{{ record.brand }}</span></p>
            <p class="text-gray-600">ขนาด: <span class="font-medium">{{ record.btu }}</span></p>
            <p class="text-gray-600">ประเภทห้อง: <span class="font-medium">{{ getRoomTypeName(record.roomType) }}</span></p>
          </div>
          <p class="text-sm text-red-500">
            * การลบข้อมูลไม่สามารถเรียกคืนได้
          </p>
        </div>

        <!-- Buttons -->
        <div class="mt-8 w-full space-y-3">
          <ion-button 
            expand="block" 
            color="danger"
            class="font-medium"
            (click)="confirmDelete()"
          >
            <ion-icon name="trash-outline" slot="start"></ion-icon>
            ยืนยันการลบ
          </ion-button>
          <ion-button 
            expand="block" 
            fill="outline"
            class="font-medium"
            (click)="dismiss()"
          >
            ยกเลิก
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
    ion-button {
      --padding-top: 1rem;
      --padding-bottom: 1rem;
    }
  `]
})
export class ConfirmDeleteModalComponent {
  @Input() record!: ServiceRecord;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  confirmDelete() {
    this.modalCtrl.dismiss({ confirmed: true });
  }

  getRoomTypeName(roomType: string): string {
    // Implement the logic to return the room type name based on the roomType
    // This is a placeholder and should be replaced with the actual implementation
    return roomType;
  }
}
