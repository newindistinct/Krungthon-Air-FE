import { Component, OnInit } from '@angular/core';
import { Customer, CustomerService } from '../../services/customer.service';
import { ModalController } from '@ionic/angular';
import { ServiceHistoryModalComponent } from './service-history-modal/service-history-modal.component';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-customer-list',
  template: `
    <app-header title="รายการลูกค้า"></app-header>
    <ion-content>
      <div class="p-4">
        <!-- ส่วนค้นหา -->
        <div class="flex space-x-2 mb-4">
          <ion-searchbar
            [(ngModel)]="searchTerm"
            placeholder="ค้นหาจากรหัสลูกค้า ชื่อ หรือที่อยู่"
            [debounce]="0"
            class="flex-1"
            [disabled]="isLoading"
          ></ion-searchbar>
          <ion-button (click)="searchCustomers()" [disabled]="isLoading">
            <ion-icon name="search-outline" slot="start"></ion-icon>
            ค้นหา
          </ion-button>
        </div>

        <!-- Loading Spinner -->
        <div *ngIf="isLoading" class="flex justify-center my-8">
          <ion-spinner name="circular"></ion-spinner>
        </div>

        <!-- รายการลูกค้า -->
        <ion-list *ngIf="!isLoading">
          <ion-item-sliding *ngFor="let customer of customers">
            <ion-item detail="true" (click)="expandItem(customer)">
              <ion-label>
                <div class="flex justify-between items-start">
                  <div>
                    <h2 class="text-sm text-gray-600">
                      {{ customer.customerId }} -
                      {{
                        customer.createdAt?.toDate() | date : 'dd/MM/yyyy HH:mm'
                      }}
                    </h2>
                    <h2 class="font-medium">
                      {{ customer.firstName }} {{ customer.lastName }}
                    </h2>
                    <p class="text-sm text-gray-600">
                      {{ customer.condoName }}
                    </p>
                    <p class="text-sm text-gray-600">
                      อาคาร {{ customer.building }} ชั้น
                      {{ customer.floor }} ห้อง
                      {{ customer.room }}
                    </p>
                  </div>
                  <div class="text-right">
                    <ion-badge color="primary" class="mb-2">
                      {{ customer.services?.length || 0 }} เครื่อง
                    </ion-badge>
                    <div
                      *ngIf="customer.lastServiceDate"
                      class="text-xs text-gray-500"
                    >
                      บริการล่าสุด:
                      <br />
                      {{
                        customer.lastServiceDate?.toDate()
                          | date : 'dd/MM/yyyy HH:mm'
                      }}
                    </div>
                  </div>
                </div>
              </ion-label>
            </ion-item>

            <div
              *ngIf="customer.isExpanded"
              class="flex flex-col gap-4 px-4 py-2"
            >
              <ion-card>
                <ion-card-header
                  class="flex flex-row  justify-between items-center"
                >
                  <ion-card-title>ข้อมูลแอร์</ion-card-title>
                  <div class="text-xs text-gray-500">
                    อัพเดทล่าสุด:
                    {{
                      customer.updatedAt?.toDate() | date : 'dd/MM/yyyy HH:mm'
                    }}
                  </div>
                </ion-card-header>

                <ion-card-content>
                  <ion-list>
                    <ion-item
                      *ngFor="let service of customer.services; let i = index"
                    >
                      <ion-label>
                        <h3 class="font-medium">เครื่องที่ {{ i + 1 }}</h3>
                        <ion-grid class="p-0">
                          <ion-row>
                            <ion-col size="6">
                              <p class="text-sm">ยี่ห้อ: {{ service.brand }}</p>
                              <p class="text-sm">BTU: {{ service.btu }}</p>
                              <p class="text-sm">อายุ: {{ service.age }}</p>
                            </ion-col>
                            <ion-col size="6">
                              <p class="text-sm">
                                ห้อง: {{ getRoomTypeName(service.roomType) }}
                              </p>
                              <p class="text-sm">
                                วงเงิน:
                                {{ service.contractAmount | number }} บาท
                              </p>
                              <p class="text-sm" *ngIf="service.note">
                                หมายเหตุ: {{ service.note }}
                              </p>
                            </ion-col>
                          </ion-row>
                        </ion-grid>
                      </ion-label>
                    </ion-item>
                  </ion-list>
                </ion-card-content>
              </ion-card>

              <!-- ประวัติการบริการ card -->
              <ion-card>
                <ion-card-header
                  class="flex flex-row  justify-between items-center"
                >
                  <ion-card-title>ประวัติการบริการ</ion-card-title>
                  <ion-button
                    fill="clear"
                    size="small"
                    (click)="addServiceHistory(customer, $event)"
                  >
                    <ion-icon
                      name="add-circle-outline"
                      slot="icon-only"
                    ></ion-icon>
                  </ion-button>
                </ion-card-header>

                <ion-card-content>
                  <ion-list
                    *ngIf="customer.serviceHistory?.length; else noHistory"
                  >
                    <ion-item
                      *ngFor="
                        let history of customer.serviceHistory;
                        let i = index
                      "
                    >
                      <ion-label>
                        <h3 class="font-medium">ครั้งที่ {{ i + 1 }}</h3>
                        <ion-grid class="p-0">
                          <ion-row>
                            <ion-col size="6">
                              <p class="text-sm">
                                เครื่อง:
                                {{
                                  getServiceInfo(customer, history.serviceId)
                                }}
                              </p>
                              <p class="text-sm">
                                ประเภท:
                                {{ getServiceTypeName(history.serviceType) }}
                              </p>
                            </ion-col>
                            <ion-col size="6">
                              <p class="text-sm" *ngIf="history.note">
                                หมายเหตุ: {{ history.note }}
                              </p>
                              <p class="text-sm">
                                วันที่:
                                {{
                                  history.createdAt?.toDate()
                                    | date : 'dd/MM/yyyy HH:mm'
                                }}
                              </p>
                            </ion-col>
                          </ion-row>
                        </ion-grid>
                      </ion-label>
                    </ion-item>
                  </ion-list>
                  <ng-template #noHistory>
                    <div class="text-center p-4 text-gray-500">
                      <p>ยังไม่มีประวัติการบริการ</p>
                    </div>
                  </ng-template>
                </ion-card-content>
              </ion-card>
            </div>
          </ion-item-sliding>
        </ion-list>

        <!-- No Results -->
        <div
          *ngIf="!isLoading && customers.length === 0"
          class="text-center p-4 text-gray-500"
        >
          <ion-icon name="search-outline" class="text-4xl"></ion-icon>
          <p>
            {{ searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'กรุณาค้นหาข้อมูลลูกค้า' }}
          </p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-badge {
        --padding-start: 8px;
        --padding-end: 8px;
      }
      ion-card {
        margin: 0;
        box-shadow: none;
        border: 1px solid #e5e7eb;
      }
      ion-card-header {
        padding: 12px 16px;
      }
      ion-item {
        --padding-start: 0;
        --inner-padding-end: 0;
      }
      .text-sm {
        font-size: 0.875rem;
        line-height: 1.25rem;
      }
      ion-spinner {
        --color: var(--ion-color-primary);
        transform: scale(1.5);
      }
      .text-xs {
        font-size: 0.75rem;
        line-height: 1rem;
      }
    `,
  ],
})
export class CustomerListComponent {
  customers: (Customer & { isExpanded?: boolean })[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(
    private customerService: CustomerService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  async searchCustomers() {
    if (!this.searchTerm.trim()) {
      const toast = await this.toastCtrl.create({
        message: 'กรุณากรอกคำค้นหา',
        duration: 2000,
        color: 'warning',
        position: 'top',
      });
      await toast.present();
      return;
    }

    try {
      this.isLoading = true;
      const allCustomers = await this.customerService.getCustomers();
      const searchTermLower = this.searchTerm.toLowerCase();

      this.customers = allCustomers.filter(
        (customer) =>
          customer.customerId?.toLowerCase().includes(searchTermLower) ||
          customer.firstName.toLowerCase().includes(searchTermLower) ||
          customer.lastName.toLowerCase().includes(searchTermLower) ||
          customer.condoName.toLowerCase().includes(searchTermLower) ||
          customer.building.toLowerCase().includes(searchTermLower) ||
          customer.room.toLowerCase().includes(searchTermLower)
      );

      if (this.customers.length > 0) {
        const toast = await this.toastCtrl.create({
          message: `พบข้อมูล ${this.customers.length} รายการ`,
          duration: 2000,
          color: 'success',
          position: 'top',
        });
        await toast.present();
      } else {
        const toast = await this.toastCtrl.create({
          message: 'ไม่พบข้อมูลที่ค้นหา',
          duration: 2000,
          color: 'warning',
          position: 'top',
        });
        await toast.present();
      }
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  expandItem(customer: Customer & { isExpanded?: boolean }) {
    customer.isExpanded = !customer.isExpanded;
  }

  // เพิ่มฟังก์ชันแปลงรหัสประเภทห้องเป็นข้อความ
  getRoomTypeName(roomType: string): string {
    const roomTypes: { [key: string]: string } = {
      bedroom: 'ห้องนอน',
      living: 'ห้องรับแขก',
      kitchen: 'ห้องครัว',
      other: 'อื่นๆ',
    };
    return roomTypes[roomType] || roomType;
  }

  async addServiceHistory(customer: Customer, event: Event) {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: ServiceHistoryModalComponent,
      componentProps: {
        customer: customer,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.success) {
      // อัพเดทข้อมูลลูกค้าในรายการที่มีอยู่
      const index = this.customers.findIndex((c) => c.id === customer.id);
      if (index !== -1) {
        this.customers[index] = data.customer;
      }

      const toast = await this.toastCtrl.create({
        message: 'บันทึกประวัติการบริการสำเร็จ',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    }
  }

  getServiceInfo(customer: Customer, serviceId: string): string {
    const service = customer.services?.find((s) => s.id === serviceId);
    if (!service) return 'ไม่พบข้อมูล';
    return `${service.brand} (${service.roomType})`;
  }

  getServiceTypeName(type: string): string {
    const types: { [key: string]: string } = {
      repair: 'ซ่อม',
      clean: 'ล้าง',
      install: 'ติดตั้ง',
      check: 'เช็คสภาพ',
      other: 'อื่นๆ',
    };
    return types[type] || type;
  }
}
