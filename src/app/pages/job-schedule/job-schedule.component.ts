import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SelectionType } from '@swimlane/ngx-datatable';
import * as dayjs from 'dayjs';
import { JobInfoComponent } from 'src/app/components/modals/job-info/job-info.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-job-schedule',
  templateUrl: './job-schedule.component.html',
  styleUrls: ['./job-schedule.component.scss'],
})
export class JobScheduleComponent implements OnInit {
  date = new Date()
  selectedColor = '';
  time = {
    // '8.00': '',
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
  column = [
    // '8.00',
    '9.00',
    '10.00',
    '11.00',
    '12.00',
    '13.00',
    '14.00',
    '15.00',
    '16.00']
  rows = []
  sites = []

  constructor(
    private firestoreService: FirestoreService,
    private service: ServiceService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    const interval = setInterval(() => {
      this.getSites();
      if (this.sites.length > 0) {
        this.initRows(this.sites);
        this.searchJobsToday();
        clearInterval(interval);
      }
    }, 1000);
  }

  getSites() {
    this.sites = this.firestoreService.getSites();
  }

  initRows(sites) {
    this.rows = sites.map((site: any) => {
      return {
        ...site,
        time: {
          // '8.00': '',
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
      console.log(event)
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

  onSelect(job) {
    this.modalController.create({
      component: JobInfoComponent,
      componentProps: {
        job: job
      },
      cssClass: 'my-custom-class',
    }).then(modal => modal.present());
  }

  randomTime() {
    const hours = [ "9.00", "10.00", "11.00", "12.00", "13.00", "14.00", "15.00", "16.00"];
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
              row.time[time] = {
                name: `${job.address} ${job.type} ${job.qty || 1} ตัว`,
                status: job.status || '',
                job: job
              };
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
