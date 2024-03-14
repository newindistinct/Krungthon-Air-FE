import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { logEvent } from 'firebase/analytics';
import { collection, where, query } from 'firebase/firestore';
import { db } from 'src/app/services/firebase-config';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-job-schedule',
  templateUrl: './job-schedule.component.html',
  styleUrls: ['./job-schedule.component.scss'],
})
export class JobScheduleComponent implements OnInit {
  date = new Date()
  selectedColor = '';
  time = {
    '8.00': '',
    '9.00': '',
    '10.00': '',
    '11.00': '',
    '12.00': '',
    '13.00': '',
    '14.00': '',
    '15.00': '',
    '16.00': '',
    '17.00': '',
    '18.00': ''
  }
  // colors = Color.filter((color: any) => color.includes('400'));
  column = ['8.00', '9.00', '10.00', '11.00', '12.00', '13.00', '14.00', '15.00', '16.00']
  rows = []
  sites = []

  constructor(
    private firestoreService: FirestoreService,
    // private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.sites = this.getSites();
    if (this.sites.length > 0) {
      this.initRows(this.sites);
      this.searchJobsToday();
    }
  }

  getSites() {
    return this.firestoreService.getSites();
  }

  initRows(sites) {
    this.rows = sites.map((site: any) => {
      return {
        ...site,
        time: {
          '8.00': '',
          '9.00': '',
          '10.00': '',
          '11.00': '',
          '12.00': '',
          '13.00': '',
          '14.00': '',
          '15.00': '',
          '16.00': '',
          '17.00': '',
          '18.00': ''
        }
      }
    })
  }

  onActivate(event: Event) {
    if (event.type === "click") {
    }
  }

  getRowClass(row) {
    return row.group !== null ? row.group.color : 'bg-white';
  }

  jobs: any = [];
  async searchJobs() {
    this.initRows(this.sites);
    this.jobs = await this.firestoreService.fetchDataJob(this.date);
    this.updateRow();
  }

  async searchJobsToday() {
    const date = new Date().setHours(0, 0, 0, 0);
    const formatQueryDate = new Date(date);
    formatQueryDate.setDate(formatQueryDate.getDate());
    this.initRows(this.sites);
    this.jobs = await this.firestoreService.fetchDataJob(formatQueryDate);
    this.updateRow();
  }



  // add() {
  //   const collectionRef = collection(db, "jobs");
  //   // const sites = ["1", "2", "3"];
  //   const groups = [{ id: "1", sites: ["1", "3"] }, { id: "2", sites: ["2"] }];
  //   const room = ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10"];
  //   const { time, hour } = this.randomTime();
  //   const num = [1, 2];
  //   const group = groups[Math.floor(Math.random() * groups.length)];
  //   const site_id = group.sites[Math.floor(Math.random() * group.sites.length)];
  //   const randomNum = Math.floor(Math.random() * num.length);
  //   const querydate = new Date().setHours(0, 0, 0, 0);
  //   const formatQueryDate = new Date(querydate);
  //   formatQueryDate.setDate(formatQueryDate.getDate() + randomNum);
  //   const nextDay = new Date(formatQueryDate);
  //   nextDay.setDate(formatQueryDate.getDate() + 1);
  //   const q = query(collectionRef,
  //     where("group_id", "==", group.id),
  //     // where("site_id", "==", site_id),
  //     where("book.date", ">", formatQueryDate),
  //     where("book.date", "<", nextDay),
  //     where("book.time", "array-contains", time),
  //   );
  //   const date = new Date().setHours(hour, 0, 0, 0);
  //   const formatDate = new Date(date);
  //   formatDate.setDate(formatDate.getDate() + randomNum);
  //   const data = {
  //     book: { time: [time], date: formatDate },
  //     group_id: group.id,
  //     job_id: "1",
  //     project_id: "1",
  //     room: room[Math.floor(Math.random() * room.length)],
  //     site_id: site_id,
  //     type: "ล้าง",
  //   }
  //   this.firestoreService.addDatatoFirebase(collectionRef, data, q);
  // }

  randomTime() {
    const hours = ["8.00", "9.00", "10.00", "11.00", "12.00", "13.00", "14.00", "15.00", "16.00"];
    const randomHourIndex = Math.floor(Math.random() * hours.length);
    const randomHour = hours[randomHourIndex];
    const hourNumber = parseInt(randomHour.split(".")[0]);
    return { time: randomHour, hour: hourNumber };
  }

  updateRow() {
    this.jobs.filter((job: any) => {
      if (job.book.time) {
        job.book.time.forEach((time: any) => {
          this.rows.filter((row: any) => {
            if (row.group_id === job.group_id && row.site_id === job.site_id) {
              row.time[time] = job.room + ' ' + job.type;
            }
          })
        });
      }
    })
  }

  formatDate(date) {
    return dayjs(date).startOf('day').format('ddd MMM DD YYYY 00:00:00 [GMT+0700]');
  }
}
