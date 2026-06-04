import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Timestamp } from 'firebase/firestore';
import {
  Customer,
  ServiceHistory,
  CustomerService,
} from 'src/app/services/customer.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-service-history-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>เพิ่มประวัติการบริการ</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <form (ngSubmit)="onSubmit()" class="p-4">
        <ion-item>
          <ion-label position="stacked">เครื่องที่ให้บริการ</ion-label>
          <ion-select [(ngModel)]="history.serviceId" name="serviceId" required>
            <ion-select-option
              *ngFor="let service of customer.services"
              [value]="service.id"
            >
              {{ service.brand }} ({{ getRoomTypeName(service.roomType) }})
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">ประเภทการบริการ</ion-label>
          <ion-select
            [(ngModel)]="history.serviceType"
            name="serviceType"
            required
          >
            <ion-select-option value="repair">ซ่อม</ion-select-option>
            <ion-select-option value="clean">ล้าง</ion-select-option>
            <ion-select-option value="install">ติดตั้ง</ion-select-option>
            <ion-select-option value="check">เช็คสภาพ</ion-select-option>
            <ion-select-option value="other">อื่นๆ</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">หมายเหตุ</ion-label>
          <ion-textarea
            [(ngModel)]="history.note"
            name="note"
            rows="3"
          ></ion-textarea>
        </ion-item>

        <div class="ion-padding">
          <ion-button expand="block" type="submit"> บันทึกประวัติ </ion-button>
        </div>
      </form>
    </ion-content>
  `,
})
export class ServiceHistoryModalComponent {
  @Input() customer!: Customer;
  history: ServiceHistory = {
    serviceId: '',
    serviceType: '',
    note: '',
  };

  constructor(
    private modalCtrl: ModalController,
    private customerService: CustomerService,
    private toastCtrl: ToastController
  ) {}

  async onSubmit() {
    if (!this.history.serviceId || !this.history.serviceType) return;

    try {
      // บันทึกประวัติการบริการ
      await this.customerService.addServiceHistory(this.customer.id!, this.history);
      
      // รีโหลดข้อมูลลูกค้า
      const updatedHistory = await this.customerService.getServiceHistory(this.customer.id!);
      
      // อัพเดทข้อมูลในหน้าจอ
      this.customer.serviceHistory = updatedHistory;
      
      // ปิด modal และส่งสถานะว่าบันทึกสำเร็จ
      this.modalCtrl.dismiss({
        success: true,
        customer: this.customer
      });
    } catch (error) {
      console.error('Error adding service history:', error);
      // แสดง toast error
      const toast = await this.toastCtrl.create({
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  getRoomTypeName(roomType: string): string {
    const types = {
      bedroom: 'ห้องนอน',
      living: 'ห้องรับแขก',
      kitchen: 'ห้องครัว',
      other: 'อื่นๆ',
    };
    return types[roomType as keyof typeof types] || roomType;
  }
}
