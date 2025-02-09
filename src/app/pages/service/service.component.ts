import { Component, OnInit } from '@angular/core';
import {
  ModalController,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { Timestamp } from 'firebase/firestore';
import {
  Customer,
  CustomerService,
  ServiceRecord,
  Site,
} from '../../services/customer.service';
import { ServiceRecordModalComponent } from './service-record-modal/service-record-modal.component';
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'src/app/services/firebase-config';
import { ConfirmDeleteModalComponent } from './confirm-delete-modal/confirm-delete-modal.component';
import { ConfirmSaveModalComponent } from './confirm-save-modal/confirm-save-modal.component';
import { SuccessModalComponent } from './success-modal/success-modal.component';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss'],
})
export class ServiceComponent implements OnInit {
  formData: Customer = {
    firstName: '',
    lastName: '',
    phone: '',
    condoName: '',
    building: '',
    floor: '',
    room: '',
    services: [],
  };

  tempServices: ServiceRecord[] = [];
  serviceRecords: ServiceRecord[] = [];
  sites: Site[] = [];

  constructor(
    private modalCtrl: ModalController,
    private customerService: CustomerService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    // this.loadCustomers();
  }

  async ngOnInit() {
    try {
      this.sites = (await this.customerService.getSites())
        .filter(site => site.name !== 'ว่าง')
        .sort((a, b) => a.name.localeCompare(b.name, 'th'));
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  }

  async loadCustomers() {   
    try {
      const customers = await this.customerService.getCustomers();
      console.log('customers', customers);      
      this.serviceRecords = customers.flatMap(
        (customer) =>
          customer.services?.map((service) => ({
            ...service,
            customerId: customer.id,
          })) || []
      );
    } catch (error) {
      this.showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      
    }
  }

  async onSubmit() {
    try {
      const modal = await this.modalCtrl.create({
        component: ConfirmSaveModalComponent,
        componentProps: {
          customer: this.formData,
          services: this.tempServices,
        },
        cssClass: 'confirm-modal',
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data?.confirmed) {
        if (this.formData.id) {
          await this.customerService.updateCustomer(this.formData.id, {
            ...this.formData,
            services: this.tempServices,
          });
          this.showToast('อัพเดทข้อมูลสำเร็จ');
        } else {
          const customerId = await this.customerService.addCustomer({
            ...this.formData,
            services: this.tempServices,
          });

          const customerRef = doc(db, 'customers', customerId);
          const customerDoc = await getDoc(customerRef);
          const customerData = customerDoc.data();

          const successModal = await this.modalCtrl.create({
            component: SuccessModalComponent,
            componentProps: {
              customerId: customerData?.customerId,
            },
            cssClass: 'small-modal',
          });

          await successModal.present();
        }
        this.resetForm();
        // await this.loadCustomers();
      }
    } catch (error) {
      this.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  }

  async addNewRecord() {
    const modal = await this.modalCtrl.create({
      component: ServiceRecordModalComponent,
      componentProps: {
        isEdit: false,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.tempServices.push({
        ...data,
        id: crypto.randomUUID(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      this.showToast('เพิ่มรายการสำเร็จ');
    }
  }

  async editRecord(record: ServiceRecord) {
    const modal = await this.modalCtrl.create({
      component: ServiceRecordModalComponent,
      componentProps: {
        record: { ...record },
        isEdit: true,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      const index = this.tempServices.findIndex((s) => s.id === record.id);
      if (index !== -1) {
        this.tempServices[index] = {
          ...data,
          id: record.id,
          updatedAt: Timestamp.now(),
        };
        this.showToast('แก้ไขรายการสำเร็จ');
      }
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  private resetForm() {
    this.formData = {
      firstName: '',
      lastName: '',
      phone: '',
      condoName: '',
      building: '',
      floor: '',
      room: '',
      services: [],
    };
    this.tempServices = [];
  }

  // Helper function สำหรับแปลงรหัสประเภทห้องเป็นข้อความ
  public getRoomTypeName(roomType: string): string {
    const types: { [key: string]: string } = {
      bedroom: 'ห้องนอน',
      living: 'ห้องรับแขก',
      kitchen: 'ห้องครัว',
      other: 'อื่นๆ',
    };
    return types[roomType] || roomType;
  }

  async deleteRecord(record: ServiceRecord, index: number) {
    const modal = await this.modalCtrl.create({
      component: ConfirmDeleteModalComponent,
      componentProps: {
        record: record,
      },
      cssClass: 'small-modal',
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.confirmed) {
      this.tempServices.splice(index, 1);
      this.showToast('ลบรายการสำเร็จ');
    }
  }
}
