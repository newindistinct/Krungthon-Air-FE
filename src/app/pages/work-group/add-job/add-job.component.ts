import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { collection, query, where } from 'firebase/firestore';
import { db } from 'src/app/services/firebase-config';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ServiceService } from 'src/app/services/service.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-job',
  templateUrl: './add-job.component.html',
  styleUrls: ['./add-job.component.scss'],
})
export class AddJobComponent implements OnInit {
  @Input() group: any;
  sites = [];
  jobs = [];
  times = []
  form: FormGroup
  minDate = new Date();
  maxDate = new Date();
  date = new Date();
  types = [
    {
      name: 'ล้าง',
      value: 'ล้าง'
    },
    {
      name: 'ติดตั้ง',
      value: 'ติดตั้ง'
    },
    {
      name: 'อื่นๆ',
      value: 'อื่นๆ'
    }
  ]
  constructor(
    private firestoreService: FirestoreService,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private service: ServiceService
  ) { }

  ngOnInit() {
    this.initDate()
    this.initSites();
    this.initForm();
    this.initTimes();

  }
  initDate() {
    this.date = new Date();
    this.minDate = new Date();
    this.maxDate.setDate(this.minDate.getDate() + 30);
  }
  initSites() {
    this.sites = this.group.site_groups.site.map((site: any) => {
      return {
        ...site,
        has_job: false
      }
    })
  }

  setSites() {
    this.sites = this.group.site_groups.site.map((site: any) => {
      return {
        ...site,
        has_job: true
      }
    })
  }

  initForm() {
    this.form = this.formBuilder.group({
      name: ['test', Validators.required],
      start_time: ['', Validators.required],
      time: ['', Validators.required],
      site_id: ['', Validators.required],
      room: ['test', Validators.required],
      building: ['test', Validators.required],
      floor: ['test', Validators.required],
      type: ['test', Validators.required],
      phone: ['test', Validators.required],
      description: ['test'],
      remark: ['test']
    })
  }

  initTimes() {
    this.times = [
      {
        time: '8.00',
        count: 0,
        has_job: false,
      },
      {
        time: '9.00',
        count: 0,
        has_job: false,
      },
      {
        time: '10.00',
        count: 0,
        has_job: false,
      },
      {
        time: '11.00',
        count: 0,
        has_job: false,
      },
      {
        time: '12.00',
        count: 0,
        has_job: false,
      },
      {
        time: '13.00',
        count: 0,
        has_job: false,
      },
      {
        time: '14.00',
        count: 0,
        has_job: false,
      },
      {
        time: '15.00',
        count: 0,
        has_job: false,
      },
      {
        time: '16.00',
        count: 0,
        has_job: false,
      },
    ]
  }

  setJob() {
    this.times = [
      {
        time: '8.00',
        count: 0,
        has_job: true,
      },
      {
        time: '9.00',
        count: 0,
        has_job: true,
      },
      {
        time: '10.00',
        count: 0,
        has_job: true,
      },
      {
        time: '11.00',
        count: 0,
        has_job: true,
      },
      {
        time: '12.00',
        count: 0,
        has_job: true,
      },
      {
        time: '13.00',
        count: 0,
        has_job: true,
      },
      {
        time: '14.00',
        count: 0,
        has_job: true,
      },
      {
        time: '15.00',
        count: 0,
        has_job: true,
      },
      {
        time: '16.00',
        count: 0,
        has_job: true,
      },
    ]
  }

  updateTimes() {
    this.jobs.filter((job: any) => {
      if (job.book.time) {
        job.book.time.forEach((time: any) => {
          this.times.filter((data: any) => {
            if (data.time === time && this.group.id === job.group_id) {
              data.count++;
              if (data.count >= this.group.limit) {
                data.has_job = false;
              }
            }
          })
        });
      }
    })
  }


  timeChange() {
    this.setSites();
    this.jobs.filter((job: any) => {
      if (job.book.time) {
        job.book.time.forEach((time: any) => {
          if (time === this.form.value.time && this.group.id === job.group_id) {
            this.sites.filter((site: any) => {
              if (site.site_id === job.site_id) {
                site.has_job = false;
              }
            })
          }
        })
      }
    })
  }

  async searchJobs() {
    this.setJob();
    const date = new Date(this.form.value.start_time);
    date.setDate(date.getDate());
    this.jobs = await this.firestoreService.fetchDataJob(date);
    if (this.jobs.length > 0) {
      this.updateTimes();
    } else {
      this.setJob();
    }
  }

  submit() {
    const time = this.form.value.time;
    const hour = time.split(".")[0];
    const collectionRef = collection(db, "jobs");
    const room = ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10"];
    const querydate = new Date(this.form.value.start_time).setHours(0, 0, 0, 0);
    const formatQueryDate = new Date(querydate);
    formatQueryDate.setDate(formatQueryDate.getDate());
    const nextDay = new Date(formatQueryDate);
    nextDay.setDate(formatQueryDate.getDate() + 1);
    const q = query(collectionRef,
      where("group_id", "==", this.group.id),
      // where("site_id", "==", site_id),
      where("book.date", ">", formatQueryDate),
      where("book.date", "<", nextDay),
      where("book.time", "array-contains", time),
    );
    const date = new Date(this.form.value.start_time).setHours(hour, 0, 0, 0);
    const formatDate = new Date(date);
    formatDate.setDate(formatDate.getDate());
    const data = {
      book: { time: [time], date: formatDate },
      group_id: this.group.id,
      job_id: uuidv4(),
      project_id: this.group.project_id,
      room: this.form.value.room,
      floor: this.form.value.floor,
      building: this.form.value.building,
      site_id: this.form.value.site_id,
      type: this.form.value.type,
      phone: this.form.value.phone,
      created_at: new Date(),
      updated_at: new Date(),

    }
    this.firestoreService.addDatatoFirebase(collectionRef, data).then(() => {
      this.service.showAlert('Success', 'เพิ่มงานสําเร็จ', () => { }, { confirmOnly: true })
      this.closeModal();
    }).catch((error) => {
      this.service.showAlert('ไม่สามารถเพิ่มงานได้', error.message, () => { }, { confirmOnly: true })
      console.error(error);
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  randomTime() {
    const hours = ["8.00", "9.00", "10.00", "11.00", "12.00", "13.00", "14.00", "15.00", "16.00"];
    const randomHourIndex = Math.floor(Math.random() * hours.length);
    const randomHour = hours[randomHourIndex];
    const hourNumber = parseInt(randomHour.split(".")[0]);
    return { time: randomHour, hour: hourNumber };
  }
}