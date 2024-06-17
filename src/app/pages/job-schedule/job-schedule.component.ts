import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SelectionType } from '@swimlane/ngx-datatable';
import * as dayjs from 'dayjs';
import { subscribeOn } from 'rxjs';
import { JobInfoComponent } from 'src/app/components/modals/job-info/job-info.component';
import { SettingEditComponent } from 'src/app/components/modals/setting-edit/setting-edit.component';
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
  subscription

  constructor(
    private firestoreService: FirestoreService,
    private service: ServiceService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.subscription = this.firestoreService.jobsChange.subscribe((jobs) => {
      this.initRows(this.sites);
      if (jobs.length > 0) {
        this.jobs = jobs;
        this.updateRow();
      }
    })
    const interval = setInterval(() => {
      this.getSites().then(() => {
        if (this.sites.length > 0) {
          this.initRows(this.sites);
          this.searchJobsToday();
          clearInterval(interval);
        }
      })
    }, 1000);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async getSites() {
    return this.sites = await this.firestoreService.getSites();
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
    await this.firestoreService.fetchDataJob(this.date);
  }

  async searchJobsToday() {
    const date = new Date().setHours(0, 0, 0, 0);
    const formatQueryDate = new Date(date);
    formatQueryDate.setDate(formatQueryDate.getDate());
    await this.firestoreService.fetchDataJob(formatQueryDate);
  }

  onSelect(job) {
    this.modalController.create({
      component: SettingEditComponent,
      componentProps: {
        type: 'job',
        job: job
      },
      cssClass: 'my-custom-class',
    }).then(modal => modal.present());
  }

  randomTime() {
    const hours = ["9.00", "10.00", "11.00", "12.00", "13.00", "14.00", "15.00", "16.00"];
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
                name: `${job.address} ${job.type}`,
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
