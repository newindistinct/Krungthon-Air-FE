import { Component, OnInit } from '@angular/core';
import { collection, where, query } from 'firebase/firestore';
import { db } from 'src/app/services/firebase-config';
import { FirestoreService } from 'src/app/services/firestore.service';

import * as dayjs from 'dayjs';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  date = new Date();
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

  work = [
    {
      work_id: '1',
      site_ref: '1',
      site_name: 'สถานที่ 1',
      group_id: '1',
      group_name: 'กลุ่ม 1',
      group_detail: 'กลุ่ม 1',
      type: 'ล้าง',
      time: ['8.00', '9.00'],
      location: 'A10',
      detail: 'รายละเอียดงาน'
    },
    {
      work_id: '2',
      site_ref: '2',
      site_name: 'สถานที่ 2',
      group_id: '1',
      group_name: 'กลุ่ม 1',
      group_detail: 'กลุ่ม 1',
      type: 'ล้าง',
      time: ['9.00'],
      location: 'A20',
      detail: 'รายละเอียดงาน'
    },
    {
      work_id: '3',
      site_ref: '3',
      site_name: 'สถานที่ 3',
      group_id: '2',
      group_name: 'กลุ่ม 2',
      group_detail: 'กลุ่ม 2',
      type: 'ล้าง',
      time: ['10.00'],
      location: 'A30',
      detail: 'รายละเอียดงาน'
    },
    {
      work_id: '4',
      site_ref: '4',
      site_name: 'สถานที่ 4',
      group_id: '3',
      group_name: 'กลุ่ม 3',
      group_detail: 'กลุ่ม 3',
      type: 'ล้าง',
      time: ['11.00'],
      location: 'A40',
      detail: 'รายละเอียดงาน'
    },
    {
      work_id: '5',
      site_ref: '5',
      site_name: 'สถานที่ 5',
      group_id: '2',
      group_name: 'กลุ่ม 2',
      group_detail: 'กลุ่ม 2',
      type: 'ล้าง',
      time: ['12.00'],
      location: 'A50',
      detail: 'รายละเอียดงาน'
    }
  ]
  constructor(
    private firestoreService: FirestoreService,
    // private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.initRows();
    // this.work.filter((work: any) => {
    //   if (work.time) {
    //     work.time.forEach((time: any) => {
    //       this.rows.filter((row: any) => {
    //         if (row.site_id === work.site_ref) {
    //           row.time[time] = work.location + ' ' + work.type;
    //         }
    //       })
    //     });
    //   }
    // });
  }

  initRows() {
    this.rows = [
      {
        color: 'bg-yellow-400',
        site_id: '1',
        group_id: '1',
        site_name: 'สถานที่ 1',
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
      },
      {
        color: 'bg-lime-400',
        site_id: '2',
        group_id: '2',
        site_name: 'สถานที่ 2',
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
      },
      {
        color: 'bg-yellow-400',
        site_id: '3',
        group_id: '1',
        site_name: 'สถานที่ 3',
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
      },
      {
        color: 'bg-pink-400',
        site_id: '4',
        group_id: '3',
        site_name: 'สถานที่ 4',
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
      },
      {
        color: 'bg-lime-400',
        site_id: '5',
        group_id: '2',
        site_name: 'สถานที่ 5',
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
    ]
  }

  onActivate(event: Event) {
    if (event.type === "click") {
    }
  }

  getRowClass(row) {
    return row.color;
  }
  jobs: any = [];
  async searchJobs() {
    this.initRows();
    this.jobs = await this.firestoreService.fetchDataJob(this.date);
    if (this.jobs.length > 0) {
      this.updateRow();
    }
  }

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
              row.time[time] = job.address + ' ' + job.type;
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
