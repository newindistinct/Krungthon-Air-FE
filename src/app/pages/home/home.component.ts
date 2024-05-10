import { Component, OnInit } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  jobPending = [];
  jobBooked = [];
  jobCompleted = [];
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
      value: 'Completed'
    },
  ]
  constructor(
    private firestoreService: FirestoreService
  ) { }

  ngOnInit() {
    this.firestoreService.fetchJobPending();
    this.firestoreService.fetchJobBooked();
    this.firestoreService.fetchJobCompleted();

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
  }

  ngOnDestroy() {
   this.firestoreService.unsubscribeSubscriptions()
  }

  segmentChanged(event) {
    this.segment = event.target.value;
  }

  formatTime(timestamp: Timestamp) {
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
}
