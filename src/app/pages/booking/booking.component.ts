import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, PopoverController } from '@ionic/angular';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { InvalidOTP, sendOTPverify, sendOTPverifyFail } from 'src/app/common/constant/alert-messages';
import { auth, db } from 'src/app/services/firebase-config';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { environment } from 'src/environments/environment';
import { AppUserService } from 'src/app/services/app-user.service';
import { JobService } from 'src/app/services/job.service';
import { AuthService } from 'src/app/services/auth.service';
import { ServiceService } from 'src/app/services/service.service';
import { Group, NewJobData, SelectOption, ServiceType, Site, TimeSlot } from 'src/app/data/models';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
  is_admin = this.route.snapshot.queryParamMap.get('is_admin');
  times: TimeSlot[] = [];
  site!: Site;
  group!: Group;
  jobs: any[] = [];
  form!: FormGroup;
  date = new Date();
  minDate = new Date();
  maxDate = new Date();

  has_date = false;
  has_time = false;

  confirmationResult: any;

  types: SelectOption<ServiceType>[] = [
    { title: 'ล้าง', value: 'ล้าง', disabled: false },
    { title: 'ตัดล้าง', value: 'ตัดล้าง', disabled: false },
    { title: 'ติดตั้ง', value: 'ติดตั้ง', disabled: false },
    { title: 'ซ่อม', value: 'ซ่อม', disabled: false },
    { title: 'อื่นๆ', value: 'อื่นๆ', disabled: false },
  ];

  constructor(
    private route: ActivatedRoute,
    private appUserService: AppUserService,
    private jobService: JobService,
    private service: ServiceService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private popoverController: PopoverController,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  async adminLogin() {
    const isLogedIn = await this.authService.SessionIsLogedIn();
    if (isLogedIn) {
      await this.authService.checkAuth().then((res) => {
        if (res) {
          const UserFormAuth = this.authService.getUserFormAuth();
          const phone = this.formatPhoneNumber(UserFormAuth.phoneNumber);
          this.appUserService.fetchUser(phone);
        }
      });
    }
  }

  formatPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length === 12 && phoneNumber.startsWith('+66')) {
      return '0' + phoneNumber.substring(3);
    }
    return phoneNumber;
  }

  onInputPhone() {
    this.form.value.phone = this.form.value.phone.replace(/[^0-9]/g, '').replace(' ', '');
  }

  initDate() {
    this.date = new Date();
    this.minDate.setDate(this.date.getDate() + 0);
    this.maxDate.setDate(this.date.getDate() + 30);
  }

  initForm() {
    this.form = this.fb.group({
      start_time: ['', Validators.required],
      time: ['', Validators.required],
      address: ['', Validators.required],
      type: ['', Validators.required],
      phone: ['', Validators.required],
      type_other: [''],
      qty: [1, Validators.required],
      description: [''],
      remark: [''],
    });
  }

  ngOnInit() {
    this.service.presentLoadingWithOutTime('รอสักครู่...');
    if (this.is_admin === 'true') {
      this.adminLogin();
    }
    this.initForm();
    this.initDate();
    this.initTimes();
    this.route.params.subscribe((param) => {
      const docRef = doc(db, 'sites', param.id);
      getDoc(docRef).then((siteDoc) => {
        this.site = siteDoc.data() as Site;
        const groupRef = collection(db, 'groups');
        const q = query(groupRef, where('id', '==', this.site.group_id));
        getDocs(q).then((querySnapshot) => {
          querySnapshot.forEach((groupDoc) => {
            this.group = groupDoc.data() as Group;
          });
          this.service.dismissLoading();
        });
      });
    });
  }

  async searchJobs() {
    this.has_date = true;
    this.form.patchValue({ time: '' });
    this.setJob();
    const date = new Date(this.form.value.start_time);
    this.jobs = await this.jobService.fetchCustomerJobs(date, this.site);
    if (this.jobs.length > 0) {
      this.updateTimes();
    } else {
      this.setJob();
    }
  }

  updateTimes() {
    this.jobs.forEach((job: any) => {
      job.book.time.forEach((time: string) => {
        const timeOption = this.times.find((t) => t.title === time);
        if (timeOption && job.group_id === this.group.id) {
          timeOption.count++;
          if (timeOption.count >= this.group.limit) {
            timeOption.title = timeOption.title + ' (มีคิวแล้ว)';
            timeOption.disabled = true;
          }
        }
        const siteTimeOption = this.times.find(
          (t) => t.title === time && job.site_id === this.site.site_id
        );
        if (siteTimeOption) {
          siteTimeOption.title = siteTimeOption.title + ' (มีคิวแล้ว)';
          siteTimeOption.disabled = true;
        }
      });
    });
  }

  newSubmit() {
    this.addJob();
  }

  addJob() {
    this.service.presentLoadingWithOutTime('กำลังจอง...');
    const name = this.appUserService.user.length > 0 ? this.appUserService.user[0].nick_name : '';
    const time: string = this.form.value.time.title;
    const hour = parseInt(time.split('.')[0], 10);
    const address: string = this.form.value.address;
    const date = new Date(this.form.value.start_time).setHours(hour, 0, 0, 0);
    const formatDate = new Date(date);
    const serviceType: ServiceType = this.form.value.type.title;

    const data: NewJobData = {
      group_id: this.group.id,
      job_id: uuidv4(),
      project_id: this.group.project_id,
      address: address.toUpperCase(),
      site_id: this.site.site_id,
      type: serviceType,
      type_other: serviceType === 'อื่นๆ' ? this.form.value.type_other : '',
      qty: this.form.value.qty,
      phone: this.form.value.phone,
      remark: this.form.value.remark,
      status: this.is_admin === 'true' ? 'BOOKED' : 'PENDING',
      is_qrcode: this.is_admin !== 'true',
      created_by: this.is_admin === 'true' ? name : 'คิวอาร์โค้ด',
      created_at: new Date(),
      updated_at: new Date(),
      book: {
        time: serviceType === 'ตัดล้าง' ? this.typeBigClean() : [time],
        date: formatDate,
      },
    };

    this.jobService.addJob(data).then(async (res) => {
      try {
        const discordPayload = {
          embeds: [{
            color: 0x00ff00,
            title: `📢 แจ้งเตือนงานใหม่: ${this.site.name}`,
            description: `📅 วันที่จอง : ${this.formatDateToThaiString(formatDate)}
🛠️  บริการ : ${serviceType} ${serviceType === 'อื่นๆ' ? `(${this.form.value.type_other})` : ''}
🔢  จำนวน : ${this.form.value.qty} ตัว
📞  เบอร์โทร : ${this.form.value.phone}
🏠  ที่อยู่/ห้อง : ${address}
📝  หมายเหตุ : ${this.form.value.remark || '-'}
👤  เพิ่มโดย : ${this.is_admin === 'true' ? name : 'คิวอาร์โค้ด'}

[คลิกเพื่อดูรายละเอียด](https://krungthon-air.web.app/krungthon/job-schedule?job_id=${res.id})`,
            timestamp: new Date().toISOString(),
          }],
        };

        const linePayload = {
          groupId: environment.notifications.lineGroupId,
          messages: [{
            type: 'text',
            text: `แจ้งเตือนงานใหม่ : ${this.site.name}
วันที่จอง : ${this.formatDateToThaiString(formatDate)}
บริการ : ${serviceType} ${serviceType === 'อื่นๆ' ? `(${this.form.value.type_other})` : ''}
จํานวน : ${this.form.value.qty} ตัว
เบอร์โทร : ${this.form.value.phone}
ที่อยู่/ห้อง : ${address}
หมายเหตุ : ${this.form.value.remark || '-'}
เพิ่มโดย : ${this.is_admin === 'true' ? name : 'คิวอาร์โค้ด'}
https://krungthon-air.web.app/krungthon/job-schedule?job_id=${res.id}`,
          }],
        };

        // await this.sendLineMessage(linePayload);
        await this.sendDiscordNotification(discordPayload);
        this.form.patchValue({ time: '' });
        this.has_date = false;
        this.initForm();
        this.service.dismissLoading();
        this.router.navigate(['booking-success']);
      } catch (error) {
        this.service.dismissLoading();
      }
    }).catch((error) => {
      this.service.dismissLoading();
      this.service.showAlert('ไม่สามารถเพิ่มงานได้', error.message, () => {}, { confirmOnly: true });
    });
  }

  addQty() {
    if (this.form.value.qty < 10) {
      this.form.patchValue({ qty: this.form.value.qty + 1 });
    }
  }

  subQty() {
    if (this.form.value.qty > 1) {
      this.form.patchValue({ qty: this.form.value.qty - 1 });
    }
  }

  addQtyByCondition() {
    const newQty = this.form.value.qty + 1;
    const newTimes = this.setTimeByQty(newQty);
    const overTime = newTimes.some((t) => t === '17.00');

    if (overTime) {
      this.service.showAlert('ไม่สามารถเพิ่มได้', 'สูงกว่า 16.00 ไม่สามารถเพิ่มได้', () => {}, { confirmOnly: true });
      return;
    }

    let conflictCount = 0;
    let siteConflictCount = 0;
    this.jobs.forEach((job: any) => {
      if (job.group_id === this.site.group_id) {
        if (job.book.time.some((t: string) => newTimes.includes(t))) { conflictCount++; }
      }
      if (job.site_id === this.site.site_id) {
        if (job.book.time.some((t: string) => newTimes.includes(t))) { siteConflictCount++; }
      }
    });

    if (siteConflictCount > 0) {
      this.service.showAlert('ไม่สามารถเพิ่มได้', `เวลา ${newTimes[newTimes.length - 1]} มีงานครบกําหนดในคอนโดแล้ว กรุณาเลือกวันหรือเวลาอื่น`, () => {}, { confirmOnly: true });
      return;
    }
    if (conflictCount >= this.group.limit) {
      this.service.showAlert('ไม่สามารถเพิ่มได้', `เวลา ${newTimes[newTimes.length - 1]} มีงานครบกําหนดในโซนแล้ว กรุณาเลือกวันหรือเวลาอื่น`, () => {}, { confirmOnly: true });
      return;
    }
    this.form.patchValue({ qty: newQty });
  }

  async signInWithPhoneNumber(phone: string) {
    this.service.presentLoadingWithOutTime('waiting...');
    const verifier = new RecaptchaVerifier(auth, 'sign-in-button', { size: 'invisible' });
    const tel = '+66' + phone.replace(/\D[^.]/g, '').slice(1);
    signInWithPhoneNumber(auth, tel, verifier)
      .then((confirmationResult) => {
        this.confirmationResult = confirmationResult;
        this.service.dismissLoading();
        this.alertEnterOTP();
      })
      .catch(() => {
        const { header, message } = sendOTPverifyFail();
        this.service.showAlert(header, message, () => { window.location.reload(); }, { confirmOnly: true });
        this.service.dismissLoading();
      });
  }

  alertEnterOTP() {
    this.alertController.create({
      mode: 'ios',
      header: 'กรุณาใส่รหัส OTP',
      inputs: [{ name: 'otp', type: 'text', placeholder: 'กรุณาใส่รหัส OTP' }],
      buttons: [
        { text: 'ยกเลิก', role: 'cancel', handler: () => {} },
        { text: 'ตกลง', handler: (data) => { this.confirmOTP(data.otp); } },
      ],
    }).then((alert) => alert.present());
  }

  confirmOTP(otp: string) {
    this.service.presentLoadingWithOutTime('waiting...');
    this.confirmationResult.confirm(otp)
      .then(async (result: any) => {
        localStorage.setItem('token', result.user.accessToken);
        this.addJob();
        this.service.dismissLoading();
      })
      .catch(() => {
        this.service.dismissLoading();
        const { header, message } = InvalidOTP();
        this.service.showAlert(header, message, () => {}, { confirmOnly: true });
      });
  }

  timeChange() {
    this.form.patchValue({ qty: 1 });
  }

  async presentPopover(e: Event) {
    const popover = await this.popoverController.create({ component: ContactComponent, event: e });
    await popover.present();
    await popover.onDidDismiss();
  }

  formatDateToThaiString(date: Date): string {
    return date.toLocaleDateString('th-TH', { hour: 'numeric', minute: 'numeric' });
  }

  setJob() {
    this.times = this.buildTimeSlots(false);
  }

  initTimes() {
    this.times = this.buildTimeSlots(true);
  }

  private buildTimeSlots(disabled: boolean): TimeSlot[] {
    return ['9.00', '10.00', '11.00', '12.00', '13.00', '14.00', '15.00', '16.00'].map(title => ({
      title,
      value: title,
      count: 0,
      disabled,
    }));
  }

  private setTimeByQty(qty: number): string[] {
    const time = parseInt(this.form.value.time.title.split('.')[0], 10);
    return Array.from({ length: qty }, (_, i) => `${time + i}.00`).filter(t => parseInt(t, 10) < 18);
  }

  private typeBigClean(): string[] {
    const time = parseInt(this.form.value.time.title.split('.')[0], 10);
    return [0, 1].map(i => `${time + i}.00`).filter(t => parseInt(t, 10) < 17);
  }

  private async sendDiscordNotification(payload: object): Promise<void> {
    await this.http.post(environment.notifications.discordWebhookUrl, payload).toPromise();
  }

  private async sendLineMessage(payload: object): Promise<void> {
    await this.http.post(environment.notifications.lineApiUrl, payload).toPromise();
  }
}
