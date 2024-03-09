import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/auth';
import { addDoc, collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { ServiceService } from './service.service';
import { Router } from '@angular/router';
import { NoUserData } from '../common/constant/alert-messages';
import { db } from './firebase-config';

import * as dayjs from 'dayjs';
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  site_id: any
  site: any;
  user: any;
  jobs: any;
  groups: any;
  equipment: any;
  building: any;
  room: any;
  siteIdChange: Subject<any> = new Subject<any>();
  siteChange: Subject<any> = new Subject<any>();
  userChange: Subject<any> = new Subject<any>();
  jobsChange: Subject<any> = new Subject<any>();
  groupsChange: Subject<any> = new Subject<any>();
  equipmentChange: Subject<any> = new Subject<any>();
  buildingChange: Subject<any> = new Subject<any>();
  roomChange: Subject<any> = new Subject<any>();
  totalUser: number;
  totalDepartment: number;
  totalSystem: number;
  totalEquipment: number;
  totalBuilding: number;
  totalRoom: number;
  has_canUse: any = [];

  sites: any;
  sitesChange: Subject<any> = new Subject<any>();
  subscribtionOnSnapshotUser: Unsubscribe;
  subscribtionOnSnapshotSite: Unsubscribe;
  subscribtionOnSnapshotDepartment: Unsubscribe;
  subscribtionOnSnapshotSystem: Unsubscribe;
  subscribtionOnSnapshotEquipment: Unsubscribe;
  subscribtionOnSnapshotBuilding: Unsubscribe;
  constructor(
    private authService: AuthService,
    private service: ServiceService,
    private router: Router
  ) { }
  async fetchDataUser(phone: any): Promise<any> {
    const q = query(collection(db, "users"), where("phone", "==", phone),);
    return await new Promise<any>((resolve) => {
      this.subscribtionOnSnapshotUser = onSnapshot(q, { includeMetadataChanges: true }, async (querySnapshot) => {
        const data: any = [];
        for (const docs of querySnapshot.docs) {
          data.push({ ...docs.data(), id: docs.id });
        }
        this.user = data;
        this.userChange.next(this.user);
        resolve(this.user);
      });
    });
  }

  async fetchDataSite(project_id): Promise<any> {
    const q = query(collection(db, "sites"), where("project_id", "==", project_id));
    return await new Promise<any>((resolve) => {
      const snapshot = getDocs(q);
      snapshot.then((querySnapshot) => {
        const data: any = [];
        for (const docs of querySnapshot.docs) {
          data.push({
            ...docs.data(),
            id: docs.id,
          });
        }
        this.sites = data;
        this.sitesChange.next(this.sites);
        resolve(data);
      })
    });
  }

  async fetchDataGroup(project_id): Promise<any> {
    const q = query(collection(db, "groups"), where("project_id", "==", project_id));
    return await new Promise<any>((resolve) => {
      const snapshot = getDocs(q);
      snapshot.then((querySnapshot) => {
        const data: any = [];
        for (const docs of querySnapshot.docs) {
          data.push({ ...docs.data() });
        }
        this.groups = data;
        this.groupsChange.next(this.groups);
        resolve(data);
      });
    });
  }

  fetchDataJob(date) {
    let nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    const q = query(collection(db, "jobs"), where("book.date", ">", date), where("book.date", "<", nextDay), where("project_id", "==", this.user[0].project_id));
    return new Promise<any>((resolve) => {
      const snapshot = getDocs(q);
      snapshot.then((querySnapshot) => {
        const data: any = [];
        for (const docs of querySnapshot.docs) {
          data.push({
            ...docs.data(),
            id: docs.id,
            time: docs.data().book.time[0],
          });
        }
        this.jobs = data;
        this.jobsChange.next(this.jobs);
        resolve(data);
      });
    });
  }

  fetchDataJobByGroup(group) {
    const querydate = new Date().setHours(0, 0, 0, 0);
    const formatQueryDate = new Date(querydate);
    formatQueryDate.setDate(formatQueryDate.getDate());
    const q = query(collection(db, "jobs"),
      where("group_id", "==", group.id),
      where("book.date", ">=", formatQueryDate),
      where("project_id", "==", group.project_id)
    );
    return new Promise<any>((resolve) => {
      const snapshot = getDocs(q);
      snapshot.then((querySnapshot) => {
        const data: any = [];
        for (const docs of querySnapshot.docs) {
          data.push({
            ...docs.data(),
            id: docs.id,
            time: docs.data().book.time[0],
          });
        }
        this.jobs = data;
        this.jobsChange.next(this.jobs);
        resolve(data);
      });
    });
  }

  async CheckUserOnSite(phone: any) {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    // const q = query(collection(db, "users"), where("user_phone", "==", phone), where("user_is_enabled", "==", true), where("user_is_deleted", "==", false));
    let site: any = [];
    const user = await new Promise<any>((resolve) => {
      const snapshot = getDocs(q);
      snapshot.then((querySnapshot) => {
        if (querySnapshot.empty) {
          const { header, message } = NoUserData();
          this.service.showAlert(header, message, () => { })
          resolve([]);
        } else {
          const data: any = [];
          for (const docs of querySnapshot.docs) {
            data.push(docs.data());
          };
          resolve(data);
        }
      });
    });
    return user;
  }
  formatDate(date) {
    return dayjs(date).startOf('day').format('ddd MMM DD YYYY 00:00:00 [GMT+0700]');
  }

  async addDatatoFirebase(collectionRef: any, data: any, q: any) {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return new Promise<any>(async (resolve) => {
        await addDoc(collectionRef, data).then((res) => {
          resolve(res);
        }).catch((error) => {
        });
      });
    } else {
      this.service.showAlert('ไม่สามารถเพิ่มงานได้', 'มีงานเวลานี้อยู่แล้ว', () => { }, { confirmOnly: true })
    }
  }

  setSiteId(siteId: string): void {
    this.site_id = siteId;
    this.siteIdChange.next(this.site_id);
  }
  getSiteId() {
    return this.site_id;
  }
  getSite() {
    return this.site;
  }
  getUser() {
    return this.user;
  }
  getDepartment() {
    return this.groups;
  }
  getSystem() {
    return this.jobs;
  }
  getEquipment() {
    return this.equipment;
  }
  getRoom() {
    return this.room;
  }
  getBuilding() {
    return this.building;
  }
  changeDatetime(timestamp: any) {
    const date = new Date(timestamp.seconds * 1000);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    };
    const formattedDate = date.toLocaleDateString('th-TH', options);
    return formattedDate;
  }

  getSites() {
    return this.sites;
  }
  getGroup() {
    this.groups.filter((item: any) => {
      const sites = []
      item.site_groups.site_id.forEach(group => {
        this.sites.filter((site: any) => {
          if (site.site_id == group) {
            sites.push(site);
            item.site_groups = { ...item.site_groups, site: sites }
          }
        })
      });
    });
    return this.groups;
  }
}

