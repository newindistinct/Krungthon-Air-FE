/**
 * @deprecated Use AppUserService, SiteGroupService, or JobService instead.
 * This class is kept temporarily for any remaining usages and will be removed.
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AppUserService } from './app-user.service';
import { SiteGroupService } from './site-group.service';
import { JobService } from './job.service';
import { AppUser, Group, Job, Site } from '../data/models';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  constructor(
    private appUserService: AppUserService,
    private siteGroupService: SiteGroupService,
    private jobService: JobService,
  ) {}

  // --- State proxies ---
  get user(): AppUser[] { return this.appUserService.user; }
  get allUsers(): AppUser[] { return this.appUserService.allUsers; }
  get sites(): Site[] { return this.siteGroupService.sites; }
  get groups(): Group[] { return this.siteGroupService.groups; }
  get jobs(): Job[] { return this.jobService.jobs; }
  get allJobs(): Job[] { return this.jobService.allJobs; }

  // --- Subject proxies ---
  get userChange(): Subject<AppUser[]> { return this.appUserService.userChange; }
  get allUsersChange(): Subject<AppUser[]> { return this.appUserService.allUsersChange; }
  get sitesChange(): Subject<Site[]> { return this.siteGroupService.sitesChange; }
  get groupsChange(): Subject<Group[]> { return this.siteGroupService.groupsChange; }
  get jobsChange(): Subject<Job[]> { return this.jobService.jobsChange; }
  get allJobsChange(): Subject<Job[]> { return this.jobService.allJobsChange; }
  get jobPendingChange(): Subject<Job[]> { return this.jobService.jobPendingChange; }
  get jobBookedChange(): Subject<Job[]> { return this.jobService.jobBookedChange; }
  get jobCompletedChange(): Subject<Job[]> { return this.jobService.jobCompletedChange; }
  get jobRejectedCanceledChange(): Subject<Job[]> { return this.jobService.jobRejectedCanceledChange; }
  get jobDashboardChange(): Subject<Job[]> { return this.jobService.jobDashboardChange; }
  get schedulesChange(): Subject<Job[]> { return this.jobService.schedulesChange; }
  get jobOnSiteChange(): Subject<Job[]> { return this.siteGroupService.jobOnSiteChange; }

  // --- Method proxies ---
  fetchDataUser(phone: string) { return this.appUserService.fetchUser(phone); }
  fetchDataAllUser(projectId: string) { return this.appUserService.fetchAllUsers(projectId); }
  CheckUserOnSite(phone: string) { return this.appUserService.checkUserOnSite(phone); }

  fetchDataSite(projectId: string) { return this.siteGroupService.fetchSites(projectId); }
  fetchDataSiteNoGroup() { return this.siteGroupService.fetchSiteNoGroup(); }
  fetchDataGroup(projectId: string) { return this.siteGroupService.fetchGroups(projectId); }
  fetchDataJobOnSite(site: any) { return this.siteGroupService.fetchJobOnSite(site); }
  getSites() { return this.siteGroupService.getSites(); }
  getGroups() { return this.siteGroupService.getGroups(); }

  fetchDataJob(date: Date) { return this.jobService.fetchJobs(date); }
  fetchDataJobSchedules(date: Date) { return this.jobService.fetchJobSchedules(date); }
  fetchDataJobByGroup(group: Group) { return this.jobService.fetchJobsByGroup(group); }
  fetchDataAllJob(projectId: string) { return this.jobService.fetchAllJobs(projectId); }
  fetchJobPending() { return this.jobService.fetchJobsPending(); }
  fetchJobBooked() { return this.jobService.fetchJobsBooked(); }
  fetchJobCompleted() { return this.jobService.fetchJobsCompleted(); }
  fetchJobRejectedCanceled() { return this.jobService.fetchJobsRejectedCanceled(); }
  fetchDataDashboard(date: Date) { return this.jobService.fetchDashboard(date); }
  fetchDataDashboardByDateRange(start: Date, end: Date) { return this.jobService.fetchDashboardByDateRange(start, end); }
  customerFetchDataJob(date: Date, site: any) { return this.jobService.fetchCustomerJobs(date, site); }
  addDatatoFirebase(collectionRef: any, data: any) { return this.jobService.addJob(data); }
  updateDatatoFirebase(docRef: any, data: any) {
    const key = typeof docRef.id === 'string' ? docRef.id : docRef.path?.split('/').pop();
    return this.jobService.updateJob(key, data);
  }
  unsubscribeSubscriptions() { return this.jobService.unsubscribeAll(); }
}
