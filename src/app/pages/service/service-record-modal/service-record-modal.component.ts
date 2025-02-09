import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-service-record-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEdit ? 'แก้ไขข้อมูลแอร์' : 'เพิ่มข้อมูลแอร์' }}</ion-title>
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
          <ion-label position="stacked">ยี่ห้อแอร์</ion-label>
          <ion-input type="text" [(ngModel)]="record.brand" name="brand" required></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">ขนาด BTU</ion-label>
          <ion-input type="text" [(ngModel)]="record.btu" name="btu" required></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">อายุเครื่อง</ion-label>
          <ion-input type="text" [(ngModel)]="record.age" name="age" required></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">ประเภทห้อง</ion-label>
          <ion-select [(ngModel)]="record.roomType" name="roomType" required>
            <ion-select-option value="bedroom">ห้องนอน</ion-select-option>
            <ion-select-option value="living">ห้องรับแขก</ion-select-option>
            <ion-select-option value="kitchen">ห้องครัว</ion-select-option>
            <ion-select-option value="other">อื่นๆ</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item *ngIf="record.roomType === 'other'">
          <ion-label position="stacked">ระบุประเภทห้อง</ion-label>
          <ion-input 
            type="text" 
            [(ngModel)]="record.roomTypeOther" 
            name="roomTypeOther" 
            required
            placeholder="กรุณาระบุประเภทห้อง"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">วงเงินสัญญา</ion-label>
          <ion-input type="number" [(ngModel)]="record.contractAmount" name="contractAmount" required></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">หมายเหตุ</ion-label>
          <ion-textarea [(ngModel)]="record.note" name="note"></ion-textarea>
        </ion-item>

        <div class="ion-padding">
          <ion-button expand="block" type="submit">
            {{ isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล' }}
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
})
export class ServiceRecordModalComponent {
  @Input() record: any = {
    brand: '',
    btu: '',
    age: '',
    roomType: '',
    roomTypeOther: '',
    contractAmount: 2500,
    note: '',
  };
  @Input() isEdit: boolean = false;

  constructor(private modalCtrl: ModalController) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onSubmit() {
    this.modalCtrl.dismiss(this.record);
  }
}
