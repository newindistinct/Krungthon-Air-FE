import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/auth';
import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { Group, Job, Site } from '../data/models';
import { AppUserService } from './app-user.service';
import { db } from './firebase-config';

@Injectable({ providedIn: 'root' })
export class SiteGroupService {
  sites: Site[] = [];
  groups: Group[] = [];
  sitesChange = new Subject<Site[]>();
  groupsChange = new Subject<Group[]>();
  jobOnSiteChange = new Subject<Job[]>();

  private subscriptionSites: Unsubscribe | undefined;
  private subscriptionGroups: Unsubscribe | undefined;
  private subscriptionOnSite: Unsubscribe | undefined;

  constructor(private appUserService: AppUserService) {}

  async fetchSites(projectId: string): Promise<Site[]> {
    const q = query(collection(db, 'sites'), where('project_id', '==', projectId));
    if (this.subscriptionSites) {
      this.subscriptionSites();
    }
    return new Promise<Site[]>((resolve) => {
      this.subscriptionSites = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Site[] = querySnapshot.docs.map(d => ({ ...d.data() as Site, key: d.id }));
        this.sites = data;
        this.sitesChange.next(data);
        resolve(data);
      });
    });
  }

  async fetchSiteNoGroup(): Promise<Site[]> {
    const projectId = this.appUserService.user[0]?.project_id;
    const q = query(
      collection(db, 'sites'),
      where('project_id', '==', projectId),
      where('group_id', '==', '')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ ...d.data() as Site, key: d.id }));
  }

  async fetchGroups(projectId: string): Promise<Group[]> {
    const q = query(collection(db, 'groups'), where('project_id', '==', projectId));
    if (this.subscriptionGroups) {
      this.subscriptionGroups();
    }
    return new Promise<Group[]>((resolve) => {
      this.subscriptionGroups = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Group[] = querySnapshot.docs.map(d => ({ ...d.data() as Group, key: d.id }));
        this.groups = data;
        this.groupsChange.next(data);
        resolve(data);
      });
    });
  }

  fetchJobOnSite(site: { site_id: string }): Promise<Job[]> {
    const querydate = new Date().setHours(0, 0, 0, 0);
    const formatQueryDate = new Date(querydate);
    formatQueryDate.setDate(formatQueryDate.getDate() + 1);
    const q = query(
      collection(db, 'jobs'),
      where('site_id', '==', site.site_id),
      where('book.date', '<', formatQueryDate)
    );
    if (this.subscriptionOnSite) {
      this.subscriptionOnSite();
    }
    return new Promise<Job[]>((resolve) => {
      this.subscriptionOnSite = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Job[] = querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id }));
        this.jobOnSiteChange.next(data);
        resolve(data);
      });
    });
  }

  getSites(): Site[] {
    if (this.groups.length > 0 && this.sites.length > 0) {
      return this.sites.map(site => {
        const siteGroup = this.groups.find(g => g.id === site.group_id);
        return {
          ...site,
          group: siteGroup ? { id: siteGroup.id, name: siteGroup.name, color: siteGroup.color } : null,
        };
      });
    }
    return [];
  }

  getGroups(): Group[] {
    if (this.groups.length > 0 && this.sites.length > 0) {
      return this.groups.map(group => {
        const groupSites = this.sites.filter(s => group.site_groups.site_id.includes(s.site_id));
        return { ...group, site_groups: { ...group.site_groups, site: groupSites } };
      });
    }
    return [];
  }

  async addSite(data: Omit<Site, 'key'>): Promise<void> {
    await addDoc(collection(db, 'sites'), data);
  }

  async updateSite(key: string, data: Partial<Site>): Promise<void> {
    await updateDoc(doc(db, 'sites', key), data);
  }

  async addGroup(data: Omit<Group, 'key'>): Promise<void> {
    await addDoc(collection(db, 'groups'), data);
  }

  async updateGroup(key: string, data: Partial<Group>): Promise<void> {
    await updateDoc(doc(db, 'groups', key), data);
  }

  async updateSiteGroupId(siteKey: string, groupId: string): Promise<void> {
    await updateDoc(doc(db, 'sites', siteKey), { group_id: groupId });
  }
}
