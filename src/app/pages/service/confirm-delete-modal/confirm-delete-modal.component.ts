import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ServiceRecord } from 'src/app/services/customer.service';

@Component({
  selector: 'app-confirm-delete-modal',
  template: `
    <ion-content class="ion-padding">
      <div class="flex flex-col items-center justify-center min-h-full max-w-md mx-auto">
        <!-- Icon Warning -->
        <div class="w-20 h-20 mb-4 rounded-full bg-red-50 flex items-center justify-center animate-pulse">
          <ion-icon 
            name="trash-outline" 
            class="text-5xl text-red-500"
          ></ion-icon>
        </div>

        <!-- Content -->
        <div class="w-full text-center space-y-3">
          <h2 class="text-xl font-semibold text-gray-800">
            ต้องการลบรายการนี้?
          </h2>
          <div class="bg-gray-50 rounded-xl p-4 mx-4">
            <div class="flex items-center gap-2 mb-2">
              <ion-icon name="snow-outline" class="text-primary"></ion-icon>
              <span class="font-medium">{{ record.brand }}</span>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
              <p>ขนาด: {{ record.btu }}</p>
              <p>ประเภทห้อง: {{ getRoomTypeName(record.roomType) }}</p>
            </div>
          </div>
          <p class="text-xs text-red-500 mt-2">
            * หากลบแล้วจะไม่สามารถกู้คืนข้อมูลได้
          </p>
        </div>

        <!-- Buttons -->
        <div class="w-full px-4 space-y-2 mt-6">
          <ion-button 
            expand="block" 
            color="danger"
            class="font-medium shadow-md"
            (click)="confirmDelete()"
          >
            <ion-icon name="trash-outline" slot="start"></ion-icon>
            ยืนยันการลบ
          </ion-button>
          <ion-button 
            expand="block" 
            fill="clear"
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
