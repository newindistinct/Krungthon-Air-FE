import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/auth';
import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { AppUser } from '../data/models';
import { db } from './firebase-config';

@Injectable({ providedIn: 'root' })
export class AppUserService {
  user: AppUser[] = [];
  allUsers: AppUser[] = [];
  userChange = new Subject<AppUser[]>();
  allUsersChange = new Subject<AppUser[]>();

  private subscriptionAllUsers: Unsubscribe | undefined;

  async fetchUser(phone: string): Promise<AppUser[]> {
    const q = query(collection(db, 'users'), where('phone', '==', phone));
    return new Promise<AppUser[]>((resolve) => {
      onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: AppUser[] = querySnapshot.docs.map(d => ({ ...d.data() as AppUser, key: d.id }));
        this.user = data;
        this.userChange.next(data);
        resolve(data);
      });
    });
  }

  async fetchAllUsers(projectId: string): Promise<AppUser[]> {
    const q = query(collection(db, 'users'), where('project_id', '==', projectId));
    if (this.subscriptionAllUsers) {
      this.subscriptionAllUsers();
    }
    return new Promise<AppUser[]>((resolve) => {
      this.subscriptionAllUsers = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: AppUser[] = querySnapshot.docs.map(d => ({ ...d.data() as AppUser, key: d.id }));
        this.allUsers = data;
        this.allUsersChange.next(data);
        resolve(data);
      });
    });
  }

  async checkUserOnSite(phone: string): Promise<AppUser[]> {
    const q = query(collection(db, 'users'), where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ ...d.data() as AppUser, key: d.id }));
  }

  async addUser(data: Omit<AppUser, 'key'>): Promise<void> {
    await addDoc(collection(db, 'users'), data);
  }

  async updateUser(key: string, data: Partial<AppUser>): Promise<void> {
    await updateDoc(doc(db, 'users', key), data);
  }
}
