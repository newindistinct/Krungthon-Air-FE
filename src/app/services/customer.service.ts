import { Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query as firestoreQuery,
  orderBy as firestoreOrderBy,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase-config';

export interface Customer {
  id?: string;
  customerId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  condoName: string;
  building: string;
  floor: string;
  room: string;
  services?: ServiceRecord[];
  serviceHistory?: ServiceHistory[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  isExpanded?: boolean;
  lastServiceDate?: Timestamp; // เพิ่ม field เก็บวันที่บริการล่าสุด
}

export interface ServiceRecord {
  id?: string;
  brand: string; // ยี่ห้อแอร์
  btu: string; // ขนาด BTU
  age: string; // อายุเครื่อง
  roomType: string; // ประเภทห้อง
  contractAmount: number; // วงเงินสัญญา
  note?: string; // หมายเหตุ
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ServiceHistory {
  id?: string;
  serviceId: string; // id ของเครื่องที่ให้บริการ
  serviceType: string; // ประเภทการบริการ
  note?: string; // หมายเหตุ
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Site {
  id?: string;
  name: string;
  address?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor() {}

  // ดึงข้อมูลลูกค้าทั้งหมด
  async getCustomers(): Promise<Customer[]> {
    const customersRef = collection(db, 'customers');
    const q = firestoreQuery(
      customersRef,
      firestoreOrderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Customer)
    );
  }

  // เพิ่มฟังก์ชันสำหรับนับจำนวนลูกค้า
  private async getNextCustomerId(): Promise<string> {
    const customersRef = collection(db, 'customers');
    const snapshot = await getDocs(customersRef);
    const count = snapshot.size + 1;
    return `${count.toString().padStart(4, '0')}`; // เช่น CUS00001
    // return `CUS${count.toString().padStart(4, '0')}`; // เช่น CUS00001
  }

  // เพิ่มข้อมูลลูกค้าใหม่
  async addCustomer(customer: Customer): Promise<string> {
    const customersRef = collection(db, 'customers');
    const customerId = await this.getNextCustomerId();

    // แปลง services array ให้มี customerId
    const services =
      customer.services?.map((service) => ({
        ...service,
        customerId,
      })) || [];

    const docRef = await addDoc(customersRef, {
      ...customer,
      customerId,
      services, // บันทึก services array
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  // อัพเดทข้อมูลลูกค้า
  async updateCustomer(
    customerId: string,
    customer: Partial<Customer>
  ): Promise<void> {
    const customerRef = doc(db, 'customers', customerId);
    const now = Timestamp.now();

    // แปลง services array ให้มี customerId
    const services =
      customer.services?.map((service) => ({
        ...service,
        customerId,
        updatedAt: now, // อัพเดตเวลาของ service
      })) || [];

    await updateDoc(customerRef, {
      ...customer,
      services,
      updatedAt: now, // อัพเดตเวลาของ customer
    });
  }

  // เพิ่มประวัติการบริการ
  async addServiceHistory(
    customerId: string,
    history: ServiceHistory
  ): Promise<void> {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);

    if (!customerDoc.exists()) {
      throw new Error('ไม่พบข้อมูลลูกค้า');
    }

    const customerData = customerDoc.data();
    const serviceHistory = customerData.serviceHistory || [];
    const now = Timestamp.now();

    // เพิ่ม timestamp และ id
    const newHistory = {
      ...history,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    // อัพเดทข้อมูล - เฉพาะ serviceHistory และ lastServiceDate
    await updateDoc(customerRef, {
      serviceHistory: [...serviceHistory, newHistory],
      lastServiceDate: now, // อัพเดทเฉพาะวันที่บริการล่าสุด
    });
  }

  // ดึงประวัติการบริการของลูกค้า
  async getServiceHistory(customerId: string): Promise<ServiceHistory[]> {
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);

    if (!customerDoc.exists()) {
      throw new Error('ไม่พบข้อมูลลูกค้า');
    }

    const customerData = customerDoc.data();
    return customerData.serviceHistory || [];
  }

  // เพิ่มเมธอดใหม่สำหรับดึงข้อมูล sites
  async getSites(): Promise<Site[]> {
    const sitesRef = collection(db, 'sites');
    const querySnapshot = await getDocs(sitesRef);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Site)
    );
  }
}
