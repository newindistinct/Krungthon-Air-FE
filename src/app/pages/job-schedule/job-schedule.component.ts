import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import * as dayjs from 'dayjs';
import { JobInfoComponent } from 'src/app/components/modals/job-info/job-info.component';
import { SettingEditComponent } from 'src/app/components/modals/setting-edit/setting-edit.component';
import { JobService } from 'src/app/services/job.service';
import { SiteGroupService } from 'src/app/services/site-group.service';
import { ServiceService } from 'src/app/services/service.service';
import { Job, Site } from 'src/app/data/models';

@Component({
  selector: 'app-job-schedule',
  templateUrl: './job-schedule.component.html',
  styleUrls: ['./job-schedule.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JobScheduleComponent implements OnInit, OnDestroy {
  uniqueDay: string[] = [];
  date = new Date();
  jobs: Job[] = [];
  column = ['9.00', '10.00', '11.00', '12.00', '13.00', '14.00', '15.00', '16.00'];
  rows: any[] = [];
  sites: Site[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private jobService: JobService,
    private siteGroupService: SiteGroupService,
    private service: ServiceService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.jobService.jobsChange.subscribe((jobs) => {
        this.initRows(this.sites);
        if (jobs.length > 0) {
          this.jobs = jobs;
          this.updateRow();
        }
      }),
      this.jobService.schedulesChange.subscribe((schedules) => {
        const days = schedules.map(s => this.formatDate((s.book.date as any).seconds * 1000));
        this.uniqueDay = [...new Set(days)];
      })
    );

    const interval = setInterval(() => {
      this.getSites().then(() => {
        if (this.sites.length > 0) {
          this.initRows(this.sites);
          this.searchJobsToday();
          this.searchJobsSchedule();
          clearInterval(interval);
        }
      });
    }, 1000);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month') {
      const diffDays = Math.ceil((cellDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 30 && this.uniqueDay) {
        return this.uniqueDay.includes(this.padZero(cellDate.getDate())) ? 'example-custom-date-class' : '';
      }
    }
    return '';
  };

  padZero = (num: number): string => num.toString().padStart(2, '0');

  async getSites(): Promise<void> {
    const sites = this.siteGroupService.getSites();
    this.sites = sites.length > 0 ? sites.filter(s => s.group_id !== '') : [];
  }

  initRows(sites: Site[]) {
    const emptyTime = {
      '9.00': '', '10.00': '', '11.00': '', '12.00': '',
      '13.00': '', '14.00': '', '15.00': '', '16.00': '',
      '17.00': '', '18.00': '',
    };
    this.rows = sites.map(site => ({ ...site, time: { ...emptyTime } }));
  }

  getRowClass(row: any): string {
    return row.group !== null ? row.group.color : 'bg-white';
  }

  async searchJobs() {
    await this.jobService.fetchJobs(this.date);
  }

  async searchJobsToday() {
    const formatQueryDate = new Date(new Date().setHours(0, 0, 0, 0));
    await this.jobService.fetchJobs(formatQueryDate);
  }

  async searchJobsSchedule() {
    const formatQueryDate = new Date(new Date().setHours(0, 0, 0, 0));
    await this.jobService.fetchJobSchedules(formatQueryDate);
  }

  onActivate(event: any) {}

  onSelect(job: Job) {
    this.modalController.create({
      component: SettingEditComponent,
      componentProps: { type: 'job', job },
      cssClass: 'my-custom-class',
    }).then(modal => modal.present());
  }

  updateRow() {
    this.jobs.forEach((job: any) => {
      if (job.book.time) {
        job.book.time.forEach((time: string) => {
          this.rows.forEach((row: any) => {
            if (row.site_id === job.site_id) {
              row.time[time] = {
                name: `${job.address} ${job.type}`,
                status: job.status || '',
                is_qrcode: job.is_qrcode || false,
                job,
              };
            }
          });
        });
      }
    });
  }

  formatDate(date: number): string {
    return dayjs(date).startOf('day').format('DD');
  }
}
