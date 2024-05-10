import { Component, Input, OnInit } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-jobs-list',
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.scss'],
})
export class JobsListComponent implements OnInit {
  @Input() jobs: any[]
  constructor(
    private firestoreService: FirestoreService
  ) { }

  ngOnInit() {
    this.sortJobs()
  }

  sortJobs(){
    this.jobs.sort((a, b) => {
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
}
