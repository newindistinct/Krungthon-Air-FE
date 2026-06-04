import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/auth';
import { addDoc, collection, doc, DocumentReference, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { Group, Job, NewJobData, Site } from '../data/models';
import { AppUserService } from './app-user.service';
import { db } from './firebase-config';
import * as dayjs from 'dayjs';

@Injectable({ providedIn: 'root' })
export class JobService {
  jobs: Job[] = [];
  allJobs: Job[] = [];

  jobsChange = new Subject<Job[]>();
  allJobsChange = new Subject<Job[]>();
  jobPendingChange = new Subject<Job[]>();
  jobBookedChange = new Subject<Job[]>();
  jobCompletedChange = new Subject<Job[]>();
  jobRejectedCanceledChange = new Subject<Job[]>();
  jobDashboardChange = new Subject<Job[]>();
  schedulesChange = new Subject<Job[]>();

  private subscriptionJobs: Unsubscribe | undefined;
  private subscriptionAllJobs: Unsubscribe | undefined;
  private subscriptionDashboard: Unsubscribe | undefined;
  private subscriptionSchedules: Unsubscribe | undefined;
  private subscriptions: Unsubscribe[] = [];

  constructor(private appUserService: AppUserService) {}

  private get projectId(): string {
    return this.appUserService.user[0]?.project_id ?? '';
  }

  fetchJobs(date: Date): Promise<Job[]> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const q = query(
      collection(db, 'jobs'),
      where('book.date', '>', date),
      where('book.date', '<', nextDay),
      where('status', 'in', ['PENDING', 'BOOKED', 'COMPLETED']),
      where('project_id', '==', this.projectId)
    );
    if (this.subscriptionJobs) {
      this.subscriptionJobs();
    }
    return new Promise<Job[]>((resolve) => {
      this.subscriptionJobs = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Job[] = querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id }));
        this.jobs = data;
        this.jobsChange.next(data);
        resolve(data);
      });
    });
  }

  fetchJobSchedules(date: Date): Promise<Job[]> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 30);
    const q = query(
      collection(db, 'jobs'),
      where('book.date', '>', date),
      where('book.date', '<', nextDay),
      where('status', 'in', ['PENDING', 'BOOKED', 'COMPLETED']),
      where('project_id', '==', this.projectId)
    );
    if (this.subscriptionSchedules) {
      this.subscriptionSchedules();
    }
    return new Promise<Job[]>((resolve) => {
      this.subscriptionSchedules = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Job[] = querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id }));
        this.schedulesChange.next(data);
        resolve(data);
      });
    });
  }

  fetchJobsByGroup(group: Group): Promise<Job[]> {
    const querydate = new Date().setHours(0, 0, 0, 0);
    const formatQueryDate = new Date(querydate);
    const q = query(
      collection(db, 'jobs'),
      where('group_id', '==', group.id),
      where('book.date', '>=', formatQueryDate),
      where('project_id', '==', group.project_id)
    );
    return getDocs(q).then(querySnapshot =>
      querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id, time: (d.data() as any).book.time[0] }))
    );
  }

  fetchAllJobs(projectId: string): Promise<Job[]> {
    const q = query(collection(db, 'jobs'), where('project_id', '==', projectId));
    if (this.subscriptionAllJobs) {
      this.subscriptionAllJobs();
    }
    return new Promise<Job[]>((resolve) => {
      this.subscriptionAllJobs = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Job[] = querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id }));
        this.allJobs = data;
        this.allJobsChange.next(data);
        resolve(data);
      });
    });
  }

  fetchJobsPending(): Promise<Job[]> {
    const formatQueryDate = this.todayStart();
    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'PENDING'),
      where('book.date', '>=', formatQueryDate)
    );
    return new Promise<Job[]>((resolve) => {
      const sub = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Job[] = querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id }));
        this.jobPendingChange.next(data);
        resolve(data);
      });
      this.subscriptions.push(sub);
    });
  }

  fetchJobsBooked(): Promise<Job[]> {
    const formatQueryDate = this.todayStart();
    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'BOOKED'),
      where('book.date', '>=', formatQueryDate)
    );
    return new Promise<Job[]>((resolve) => {
      const sub = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Job[] = querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id }));
        this.jobBookedChange.next(data);
        resolve(data);
      });
      this.subscriptions.push(sub);
    });
  }

  fetchJobsCompleted(): Promise<Job[]> {
    const formatQueryDate = this.todayStart();
    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'COMPLETED'),
      where('book.date', '>=', formatQueryDate)
    );
    return new Promise<Job[]>((resolve) => {
      const sub = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Job[] = querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id }));
        this.jobCompletedChange.next(data);
        resolve(data);
      });
      this.subscriptions.push(sub);
    });
  }

  fetchJobsRejectedCanceled(): Promise<Job[]> {
    const formatQueryDate = this.todayStart();
    const q = query(
      collection(db, 'jobs'),
      where('status', 'in', ['REJECTED', 'CANCELED']),
      where('book.date', '>=', formatQueryDate)
    );
    return new Promise<Job[]>((resolve) => {
      const sub = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Job[] = querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id }));
        this.jobRejectedCanceledChange.next(data);
        resolve(data);
      });
      this.subscriptions.push(sub);
    });
  }

  fetchDashboard(date: Date): Promise<Job[]> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const q = query(
      collection(db, 'jobs'),
      where('book.date', '>', date),
      where('book.date', '<', nextDay),
      where('project_id', '==', this.projectId || '1')
    );
    if (this.subscriptionDashboard) {
      this.subscriptionDashboard();
    }
    return new Promise<Job[]>((resolve) => {
      this.subscriptionDashboard = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Job[] = querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id }));
        this.jobDashboardChange.next(data);
        resolve(data);
      });
    });
  }

  fetchDashboardByDateRange(startDate: Date, endDate: Date): Promise<Job[]> {
    const start = dayjs(startDate).startOf('day').toDate();
    const end = dayjs(endDate).endOf('day').toDate();
    const q = query(
      collection(db, 'jobs'),
      where('book.date', '>=', start),
      where('book.date', '<=', end),
      where('project_id', '==', this.projectId || '1')
    );
    if (this.subscriptionDashboard) {
      this.subscriptionDashboard();
    }
    return new Promise<Job[]>((resolve) => {
      this.subscriptionDashboard = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const data: Job[] = querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id }));
        this.jobDashboardChange.next(data);
        resolve(data);
      });
    });
  }

  fetchCustomerJobs(date: Date, site: Pick<Site, 'project_id' | 'group_id'>): Promise<Job[]> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const q = query(
      collection(db, 'jobs'),
      where('book.date', '>', date),
      where('book.date', '<', nextDay),
      where('status', 'in', ['BOOKED', 'PENDING']),
      where('project_id', '==', site.project_id),
      where('group_id', '==', site.group_id)
    );
    return getDocs(q).then(querySnapshot =>
      querySnapshot.docs.map(d => ({ ...d.data() as Job, key: d.id }))
    );
  }

  async addJob(data: NewJobData): Promise<DocumentReference> {
    return addDoc(collection(db, 'jobs'), data);
  }

  async updateJob(key: string, data: Partial<Job>): Promise<void> {
    await updateDoc(doc(db, 'jobs', key), data as Record<string, unknown>);
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach(sub => sub());
    this.subscriptions = [];
  }

  private todayStart(): Date {
    return new Date(new Date().setHours(0, 0, 0, 0));
  }
}
