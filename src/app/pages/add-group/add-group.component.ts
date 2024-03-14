// import { query } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { collection, where, query } from 'firebase/firestore';
import { db } from 'src/app/services/firebase-config';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ServiceService } from 'src/app/services/service.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss'],
})
export class AddGroupComponent implements OnInit {
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
      id: [''],
      image: [''],
      limit: [''],
      name: ['', Validators.required],
      site: ['', Validators.required],
      reader: ['', Validators.required],
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
    const collectionRef = collection(db, "groups");
    // const q = query(collectionRef,
    //   // where("group_id", "==", this.group.id),
    //   // where("site_id", "==", site_id),
    //   // where("book.date", ">", formatQueryDate),
    //   // where("book.date", "<", nextDay),
    //   // where("book.time", "array-contains", time),
    // );
    const data = {
      id: uuidv4(),
      name: this.form.value.name,
      site: this.form.value.site,
      image: this.form.value.image,
      limit: this.form.value.limit,
      reader: this.form.value.reader,
      project_id: this.firestoreService.user[0].project_id,
    }
    this.firestoreService.addDatatoFirebase(collectionRef, data).then(() => {
      this.service.showAlert('Success', 'เพิ่มทีมสําเร็จ', () => { }, { confirmOnly: true })
      this.closeModal();
    }).catch((error) => {
      this.service.showAlert('ไม่สามารถเพิ่มทีมได้', error.message, () => { }, { confirmOnly: true })
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
