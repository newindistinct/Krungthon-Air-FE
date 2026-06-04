import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { doc, getDoc } from 'firebase/firestore';
import { JobInfoComponent } from 'src/app/components/modals/job-info/job-info.component';
import { db } from 'src/app/services/firebase-config';
import { JobService } from 'src/app/services/job.service';
import { SiteGroupService } from 'src/app/services/site-group.service';
import { ServiceService } from 'src/app/services/service.service';
import { Job, JobStatus, Site } from 'src/app/data/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  param_id = this.route.snapshot.queryParamMap.get('job_id');
  sites: Site[] = [];
  jobPending: Job[] = [];
  jobBooked: Job[] = [];
  jobCompleted: Job[] = [];
  jobRejectedCanceled: Job[] = [];
  segment = 'booking';
  segment_option = [
    { title: 'รับงาน', value: 'booking' },
    { title: 'รอดำเนินการ', value: 'pending' },
    { title: 'เสร็จสิ้น', value: 'completed' },
    { title: 'ยกเลิกแล้ว', value: 'rejected-canceled' },
  ];

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private siteGroupService: SiteGroupService,
    private service: ServiceService,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    if (this.param_id) {
      getDoc(doc(db, 'jobs', this.param_id)).then(jobDoc => {
        if (jobDoc.exists()) { this.infoJob(jobDoc.data() as Job); }
      });
    }

    this.siteGroupService.fetchSites('1');
    this.jobService.fetchJobsPending();
    this.jobService.fetchJobsBooked();
    this.jobService.fetchJobsCompleted();
    this.jobService.fetchJobsRejectedCanceled();

    this.siteGroupService.sitesChange.subscribe(sites => { this.sites = sites; });
    this.jobService.jobPendingChange.subscribe(jobs => { this.jobPending = jobs; this.sortJobs(this.jobPending); });
    this.jobService.jobBookedChange.subscribe(jobs => { this.jobBooked = jobs; this.sortJobs(this.jobBooked); });
    this.jobService.jobCompletedChange.subscribe(jobs => { this.jobCompleted = jobs; this.sortJobs(this.jobCompleted); });
    this.jobService.jobRejectedCanceledChange.subscribe(jobs => { this.jobRejectedCanceled = jobs; this.sortJobs(this.jobRejectedCanceled); });
  }

  ngOnDestroy() {
    this.jobService.unsubscribeAll();
  }

  acceptJob(job: Job) {
    const docRef = doc(db, 'jobs', job.key!);
    this.service.showAlert('ยืนยัน', 'ยืนยันการรับงาน', () => {
      this.jobService.updateJob(job.key!, { status: 'BOOKED' });
    }, { confirmOnly: false });
  }

  completeJob(job: Job) {
    this.service.showAlert('ยืนยัน', 'ยืนยันการส่งงาน', () => {
      this.jobService.updateJob(job.key!, { status: 'COMPLETED' });
    }, { confirmOnly: false });
  }

  cancelJob(job: Job) {
    this.service.showAlert('ยืนยัน', 'ยืนยันการยกเลิกงาน', () => {
      this.jobService.updateJob(job.key!, { status: 'CANCELED' });
    }, { confirmOnly: false });
  }

  rejectJob(job: Job) {
    this.service.showAlert('ยืนยัน', 'ยืนยันการปฏิเสธงาน', () => {
      this.jobService.updateJob(job.key!, { status: 'REJECTED' });
    }, { confirmOnly: false });
  }

  infoJob(job: Job) {
    this.modalController.create({
      component: JobInfoComponent,
      componentProps: { job },
      cssClass: 'my-custom-class',
    }).then(modal => modal.present());
  }

  segmentChanged(event: any) {
    this.segment = event.target.value;
  }

  formatTime(timestamp: any): string {
    const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  sortJobs(jobs: Job[]) {
    jobs.sort((a, b) => {
      const aDate = (a.book.date as any).seconds;
      const bDate = (b.book.date as any).seconds;
      if (aDate !== bDate) { return aDate - bDate; }
      return a.book.time[0] < b.book.time[0] ? -1 : a.book.time[0] > b.book.time[0] ? 1 : 0;
    });
  }

  getSiteName(site_id: string): string {
    return this.sites.find(s => s.site_id === site_id)?.name ?? '';
  }
}
