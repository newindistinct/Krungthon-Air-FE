import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { InvalidOTP, sendOTPverify, sendOTPverifyFail } from 'src/app/common/constant/alert-messages';
import { auth, db } from 'src/app/services/firebase-config';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ServiceService } from 'src/app/services/service.service';

import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
  times: any
  site: any
  group: any
  jobs: any
  form: FormGroup
  date = new Date();
  minDate = new Date();
  maxDate = new Date();

  has_date = false
  has_time = false

  confirmationResult;

  types = [
    {
      title: 'ล้าง',
      value: 'ล้าง',
      disabled: false
    },
    {
      title: 'ติดตั้ง',
      value: 'ติดตั้ง',
      disabled: false
    },
    {
      title: 'อื่นๆ',
      value: 'อื่นๆ',
      disabled: false
    }
  ]
  constructor(
    private action: ActivatedRoute,
    private firestoreService: FirestoreService,
    private service: ServiceService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private http: HttpClient
  ) { }

  onInputPhone() {
    //('ionInput', this.ionInputDepartmentName.value);
    console.log(this.form.value.phone);
    this.form.value.phone = this.form.value.phone.replace(/[^0-9]/g, '').replace(' ', '');
  }

  initDate() {
    this.date = new Date();
    this.minDate = new Date();
    this.maxDate.setDate(this.minDate.getDate() + 30);
  }
  initForm() {
    this.form = this.fb.group({
      // name: ['test', Validators.required],
      start_time: ['', Validators.required],
      time: ['', Validators.required],
      // site_id: ['', Validators.required],
      room: ['', Validators.required],
      // building: ['test', Validators.required],
      // floor: ['test', Validators.required],
      type: ['', Validators.required],
      phone: ['', Validators.required],
      type_other: [''],
      qty: [1, Validators.required],
      // description: ['test'],
      // remark: ['test']
    })
  }

  ngOnInit() {
    this.initForm()
    this.initDate()
    this.initTimes();
    this.action.params.subscribe(param => {
      const docRef = doc(db, "sites", param.id);
      getDoc(docRef).then((site) => {
        this.site = site.data()
        const groupRef = collection(db, "groups");
        const q = query(groupRef, where("id", "==", site.data().group_id));
        getDocs(q).then((querySnapshot) => {
          querySnapshot.forEach((group) => {
            this.group = group.data()
            // const jobRef = collection(db, "jobs");
            // const q = query(jobRef, where("site_id", "in", doc.data().site_groups.site_id));
            // const data = []
            // getDocs(q).then((querySnapshot) => {
            //   querySnapshot.forEach((doc) => {
            //     data.push({ ...doc.data() });
            //   });
            //   this.jobs = data
            //   console.log('jobs', this.jobs)
            //   console.log('site', this.site)
            //   console.log('group', this.group)
            // });
          });
        })
      })
    })
  }

  async searchJobs() {
    this.has_date = true
    this.form.patchValue({
      time: ''
    })
    this.setJob();
    const date = new Date(this.form.value.start_time);
    date.setDate(date.getDate());
    this.jobs = await this.firestoreService.customerFetchDataJob(date, this.site);
    if (this.jobs.length > 0) {
      this.updateTimes();
    } else {
      this.setJob();
    }
  }

  updateTimes() {
    this.jobs.filter((job: any) => {
      if (job.book.time) {
        job.book.time.forEach((time: any) => {
          this.times.filter((data: any) => {
            if (data.title === time && this.group.id === job.group_id) {
              data.count++;
              // if (data.count >= this.group.limit) {
              data.disabled = true;
              // }
            }
          })
        });
      }
    })
  }

  newSubmit() {
    this.checkJobByPhone(this.form.value.phone).then((data) => {
      if (data.length > 0) {
        this.service.showAlert('ไม่สามารถเพิ่มงานได้', 'มีงานแล้ว', () => { }, { confirmOnly: true })
      } else {
        this.LoginWithPhone(this.form.value.phone);
      }
    })
  }

  checkJobByPhone(phone) {
    const collectionRef = collection(db, "jobs");
    const q = query(collectionRef, where("phone", "==", phone));
    const data = []
    return new Promise<any>((resolve) => {
      getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          data.push({ ...doc.data() });
        });
        console.log('jobs', data)
        resolve(data)
      });
    })
  }

  LoginWithPhone(phone: string) {
    const { header, message } = sendOTPverify(phone);
    this.service.showAlert(header, message, () => {
      this.signInWithPhoneNumber(phone);
    }, { confirmOnly: false });
  }

  addJob() {
    const time = this.form.value.time.title;
    const hour = time.split(".")[0];
    this.qtyMoreThanOne(this.form.value.qty);
    const collectionRef = collection(db, "jobs");
    const date = new Date(this.form.value.start_time).setHours(hour, 0, 0, 0);
    const formatDate = new Date(date);
    formatDate.setDate(formatDate.getDate());
    const data = {
      book: { time: this.form.value.qty > 1 ? this.qtyMoreThanOne(this.form.value.qty) : [time], date: formatDate },
      group_id: this.group.id,
      job_id: uuidv4(),
      project_id: this.group.project_id,
      room: this.form.value.room,
      floor: this.form.value.floor || '',
      building: this.form.value.building || '',
      site_id: this.site.site_id,
      type: this.form.value.type.title,
      phone: this.form.value.phone,
      created_at: new Date(),
      updated_at: new Date(),
    }
    this.firestoreService.addDatatoFirebase(collectionRef, data).then(() => {
      try {
        this.test().then((res) => {
          console.log(res);
        })
        this.service.showAlert('Success', 'เพิ่มงานสําเร็จ', () => { }, { confirmOnly: true })
      } catch (error) {
        console.error(error);
      }
    }).catch((error) => {
      this.service.showAlert('ไม่สามารถเพิ่มงานได้', error.message, () => { }, { confirmOnly: true })
      console.error(error);
    });

  }

  lineNotify() {
    return this.http.post<any>('https://notify-api.line.me/api/notify', {
      params: {
        message: `วันที่ : ${this.form.value.start_time} 
        ห้อง : ${this.form.value.room} 
        บริการ : ${this.form.value.type.title} 
        จํานวน : ${this.form.value.qty} ตัว 
        เบอร์โทร :${this.form.value.phone}`,
        stickerPackageId: 6632,
        stickerId: 11825396
      }
    }, {
      headers: {
        Authorization: 'Bearer 3wxeL2CNj7vBWIuteKDNhiWCx5dT9vQrhYScH86eCGn'
      }
    })
  }

  async test() {
    return await axios({
      method: "post",
      url: "https://notify-api.line.me/api/notify",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // "Authorization": "Bearer 3wxeL2CNj7vBWIuteKDNhiWCx5dT9vQrhYScH86eCGn",
        "Authorization": "Bearer 44MKbwPihLY8IzYYNJmTjk6WQfkxJMZ7XN4LZwIJcd4",
      },
      data: 'message=hello'
    })
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  qtyMoreThanOne(qty) {
    let times = []
    let time = this.form.value.time.title.split(".")[0] // 8.00
    time = parseInt(time)
    for (let i = 0; i < qty; i++) {
      if (time + i < 17) {
        times.push(`${time + i}.00`);
      }
    }
    console.log('times', times)
    return times
  }

  async signInWithPhoneNumber(phone: any) {
    this.service.presentLoadingWithOutTime("waiting...");
    const verifier = new RecaptchaVerifier(auth, 'sign-in-button', {
      size: 'invisible'
    });
    let tel = "+66" + phone.replace(/\D[^.]/g, '').slice(1);
    signInWithPhoneNumber(auth, tel, verifier)
      .then((confirmationResult) => {
        this.confirmationResult = confirmationResult;
        this.service.dismissLoading();
        this.alertEnterOTP();
      }).catch((error) => {
        console.log(error);
        const { header, message } = sendOTPverifyFail();
        this.service.showAlert(header, message, () => {
          window.location.reload();
        }, { confirmOnly: true })
        this.service.dismissLoading();
      });
  }

  alertEnterOTP() {
    this.alertController.create({
      mode: 'ios',
      header: 'กรุณาใส่รหัส OTP',
      inputs: [
        {
          name: 'otp',
          type: 'text',
          cssClass: 'bg-transparent appearance-none border-2 border-gray-400 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500',
          placeholder: 'กรุณาใส่รหัส OTP'
        }
      ],
      buttons: [
        {
          text: 'ยกเลิก',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'ตกลง',
          handler: (data) => {
            this.confirmOTP(data.otp);
          }
        }
      ]
    }).then(alert => {
      alert.present();
    });
  }

  // onSignInSubmit() {
  //   // Code to submit the verification code entered by the user
  // }

  confirmOTP(otp: string) {
    this.service.presentLoadingWithOutTime("waiting...");
    this.confirmationResult.confirm(otp).then(async (result: any) => {
      const user = result.user;
      localStorage.setItem('token', user.accessToken);
      // window.location.reload();
      this.addJob();
      this.service.dismissLoading();
    }).catch((error: any) => {
      this.service.dismissLoading();
      const { header, message } = InvalidOTP();
      this.service.showAlert(header, message, () => { }, { confirmOnly: true })
    });
  }

  setJob() {
    this.times = [
      {
        title: '8.00',
        count: 0,
        disabled: false,
      },
      {
        title: '9.00',
        count: 0,
        disabled: false,
      },
      {
        title: '10.00',
        count: 0,
        disabled: false,
      },
      {
        title: '11.00',
        count: 0,
        disabled: false,
      },
      {
        title: '12.00',
        count: 0,
        disabled: false,
      },
      {
        title: '13.00',
        count: 0,
        disabled: false,
      },
      {
        title: '14.00',
        count: 0,
        disabled: false,
      },
      {
        title: '15.00',
        count: 0,
        disabled: false,
      },
      {
        title: '16.00',
        count: 0,
        disabled: false,
      },
    ]
  }

  initTimes() {
    this.times = [
      {
        title: '8.00',
        count: 0,
        disabled: true,
      },
      {
        title: '9.00',
        count: 0,
        disabled: true,
      },
      {
        title: '10.00',
        count: 0,
        disabled: true,
      },
      {
        title: '11.00',
        count: 0,
        disabled: true,
      },
      {
        title: '12.00',
        count: 0,
        disabled: true,
      },
      {
        title: '13.00',
        count: 0,
        disabled: true,
      },
      {
        title: '14.00',
        count: 0,
        disabled: true,
      },
      {
        title: '15.00',
        count: 0,
        disabled: true,
      },
      {
        title: '16.00',
        count: 0,
        disabled: true,
      },
    ]
  }
}
