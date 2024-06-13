import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Timestamp, doc } from 'firebase/firestore';
import { JobInfoComponent } from 'src/app/components/modals/job-info/job-info.component';
import { db } from 'src/app/services/firebase-config';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  job_id = this.route.snapshot.paramMap.get('job_id');
  sites = [];
  jobPending = [];
  jobBooked = [];
  jobCompleted = [];
  jobRejectedCanceled = [];
  segment = 'booking';
  segment_option = [
    {
      title: 'รับงาน',
      value: 'booking'
    },
    {
      title: 'รอดำเนินการ',
      value: 'pending'
    },
    {
      title: 'เสร็จสิ้น',
      value: 'completed'
    },
    {
      title: 'ยกเลิกแล้ว',
      value: 'rejected-canceled'
    }
  ]
  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private service: ServiceService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.firestoreService.fetchDataSite('1');
    this.firestoreService.fetchJobPending();
    this.firestoreService.fetchJobBooked();
    this.firestoreService.fetchJobCompleted();
    this.firestoreService.fetchJobRejectedCanceled();
    this.firestoreService.sitesChange.subscribe(sites => {
      this.sites = sites;
    })
    this.firestoreService.jobPendingChange.subscribe(jobs => {
      this.jobPending = jobs;
      this.sortJobs(this.jobPending);
    })
    this.firestoreService.jobBookedChange.subscribe(jobs => {
      this.jobBooked = jobs;
      this.sortJobs(this.jobBooked);
    })
    this.firestoreService.jobCompletedChange.subscribe(jobs => {
      this.jobCompleted = jobs;
      this.sortJobs(this.jobCompleted);
    })
    this.firestoreService.jobRejectedCanceledChange.subscribe(jobs => {
      this.jobRejectedCanceled = jobs;
      this.sortJobs(this.jobRejectedCanceled);
    })
    if (this.job_id) {
      
    }
  }

  ngOnDestroy() {
    this.firestoreService.unsubscribeSubscriptions()
  }

  acceptJob(job) {
    const docRef = doc(db, 'jobs', job.key);
    const data = {
      status: 'BOOKED',
    }
    this.service.showAlert('ยืนยัน', 'ยืนยันการรับงาน', () => {
      this.firestoreService.updateDatatoFirebase(docRef, data)
    }, { confirmOnly: false });
  }

  rejectJob(job) {
    const docRef = doc(db, 'jobs', job.key);
    const data = {
      status: 'REJECTED',
    }
    this.service.showAlert('ยืนยัน', 'ยืนยันการปฏิเสธงาน', () => {
      this.firestoreService.updateDatatoFirebase(docRef, data)
    }, { confirmOnly: false });
  }

  completeJob(job) {
    const docRef = doc(db, 'jobs', job.key);
    const data = {
      status: 'COMPLETED',
    }
    this.service.showAlert('ยืนยัน', 'ยืนยันการส่งงาน', () => {
      this.firestoreService.updateDatatoFirebase(docRef, data)
    }, { confirmOnly: false });
  }

  cancelJob(job) {
    const docRef = doc(db, 'jobs', job.key);
    const data = {
      status: 'CANCELED',
    }
    this.service.showAlert('ยืนยัน', 'ยืนยันการยกเลิกงาน', () => {
      this.firestoreService.updateDatatoFirebase(docRef, data)
    }, { confirmOnly: false });
  }

  reportJob(job) {
    // this.firestoreService.reportJob(job);
  }

  infoJob(job) {
    this.modalController.create({
      component: JobInfoComponent,
      componentProps: {
        job: job
      },
      cssClass: 'my-custom-class',
    }).then(modal => modal.present());
  }

  openJob(job) {
    // this.firestoreService.openJob(job);
  }

  segmentChanged(event) {
    this.segment = event.target.value;
  }

  formatTime(timestamp: Timestamp) {
    const date = new Date(timestamp.seconds * 1000);
    const options: Intl.DateTimeFormatOptions = {
      // year: 'numeric',
      // month: 'long',
      // day: 'numeric',
      // hour: 'numeric',
      // minute: 'numeric',
      // second: 'numeric',
      // timeZoneName: 'short'
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      // hour: '2-digit',
      // minute: '2-digit',
      // second: '2-digit'
    };
    const formattedDate = date.toLocaleDateString('th-TH', options);
    return formattedDate;
  }
  sortJobs(jobs) {
    jobs.sort((a, b) => {
      if (a.book.date.seconds < b.book.date.seconds) {
        return -1
      } else if (a.book.date.seconds > b.book.date.seconds) {
        return 1
      } else {
        if (a.book.time[0] < b.book.time[0]) {
          return -1
        } else if (a.book.time[0] > b.book.time[0]) {
          return 1
        } else {
          return 0
        }
      }
    })
  }
  getSiteName(site_id: string) {
    const site = this.sites.find(site => site.site_id === site_id);
    return site ? site.name : '';
  }

}
