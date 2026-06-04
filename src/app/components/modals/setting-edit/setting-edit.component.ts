import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { getColor } from 'src/app/data/interfaces/color';
import { AppUserService } from 'src/app/services/app-user.service';
import { SiteGroupService } from 'src/app/services/site-group.service';
import { JobService } from 'src/app/services/job.service';
import { ServiceService } from 'src/app/services/service.service';
import { AppUser, Group, Job, SelectOption, ServiceType, Site } from 'src/app/data/models';

@Component({
  selector: 'app-setting-edit',
  templateUrl: './setting-edit.component.html',
  styleUrls: ['./setting-edit.component.scss'],
})
export class SettingEditComponent implements OnInit {
  @Input() type!: string;
  @Input() user!: AppUser;
  @Input() site!: Site;
  @Input() group!: Group;
  @Input() job!: Job;

  site_job: any;
  has_date = false;
  jobs: Job[] = [];
  title = '';
  form!: FormGroup;
  sites: SelectOption[] = [];
  colors: SelectOption[] = [];
  date = new Date();

  readonly types: SelectOption<ServiceType>[] = [
    { title: 'ล้าง', value: 'ล้าง', disabled: false },
    { title: 'ตัดล้าง', value: 'ตัดล้าง', disabled: false },
    { title: 'ติดตั้ง', value: 'ติดตั้ง', disabled: false },
    { title: 'ซ่อม', value: 'ซ่อม', disabled: false },
    { title: 'อื่นๆ', value: 'อื่นๆ', disabled: false },
  ];

  readonly statuses: SelectOption[] = [
    { title: 'รออนุมัติ', value: 'PENDING', disabled: false },
    { title: 'รอดำเนินงาน', value: 'BOOKED', disabled: false },
    { title: 'สําเร็จ', value: 'COMPLETED', disabled: false },
    { title: 'ปฏิเสธ', value: 'REJECTED', disabled: false },
    { title: 'ยกเลิก', value: 'CANCELED', disabled: false },
    { title: 'หมดอายุ', value: 'EXPIRED', disabled: false },
  ];

  times: SelectOption[] = [
    { title: '9.00', value: '9.00', disabled: false },
    { title: '10.00', value: '10.00', disabled: false },
    { title: '11.00', value: '11.00', disabled: false },
    { title: '12.00', value: '12.00', disabled: false },
    { title: '13.00', value: '13.00', disabled: false },
    { title: '14.00', value: '14.00', disabled: false },
    { title: '15.00', value: '15.00', disabled: false },
    { title: '16.00', value: '16.00', disabled: false },
  ];

  constructor(
    private appUserService: AppUserService,
    private siteGroupService: SiteGroupService,
    private jobService: JobService,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private service: ServiceService
  ) {}

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    switch (this.type) {
      case 'user':
        this.title = 'แก้ไขผู้ใช้';
        this.initFormUser();
        break;
      case 'site':
        this.title = 'แก้ไขโครงการ';
        this.initFormSite();
        break;
      case 'group':
        this.title = 'แก้ไขกลุ่ม';
        this.setColor();
        this.setSite();
        this.initFormGroup();
        break;
      case 'job':
        this.title = 'แก้ไขงาน';
        this.initFormJob();
        this.initForEditJob(this.job);
        break;
    }
  }

  initFormUser() {
    this.form = this.formBuilder.group({
      name: [this.user.name, Validators.required],
      last_name: [this.user.last_name, Validators.required],
      nick_name: [this.user.nick_name || '', Validators.required],
      phone: [this.user.phone, Validators.required],
    });
  }

  initFormSite() {
    this.form = this.formBuilder.group({
      name: [this.site.name, Validators.required],
      group_id: [this.site.group_id],
    });
  }

  initFormGroup() {
    this.form = this.formBuilder.group({
      name: [this.group.name, Validators.required],
      reader: [this.group.reader],
      limit: [this.group.limit],
      color: [this.group.color ? this.colors.find(c => c.value === this.group.color) || '' : ''],
      site_groups: [
        this.group.site_groups
          ? this.sites.filter(s => this.group.site_groups.site_id.includes(s.value)) || ''
          : [],
        Validators.required,
      ],
    });
  }

  initFormJob() {
    this.form = this.formBuilder.group({
      date: [this.has_date ? this.form.value.date : new Date((this.job.book.date as any).seconds * 1000), Validators.required],
      time: [this.has_date ? this.form.value.time : this.times.find(t => t.title === this.job.book.time[0]), Validators.required],
      address: [this.job.address, Validators.required],
      phone: [this.job.phone, Validators.required],
      qty: [this.job.qty, Validators.required],
      type: [this.job.type ? this.types.find(t => t.value === this.job.type) || '' : '', Validators.required],
      type_other: [this.job.type_other || ''],
      created_by: [this.job.created_by || ''],
      status: [this.job.status ? this.statuses.find(s => s.value === this.job.status) || '' : '', Validators.required],
      remark: [this.job.remark],
    });
  }

  async initForEditJob(job: Job) {
    this.service.presentLoadingWithOutTime('รอสักครู่...');
    this.date = new Date();
    await this.searchJobs();
  }

  async searchJobs() {
    const date = new Date(this.form.value.date).setHours(0, 0, 0, 0);
    this.jobs = await this.jobService.fetchCustomerJobs(new Date(date), this.job as any);
    if (this.jobs.length > 0) {
      this.updateTimes();
    } else {
      this.setJob();
      this.service.dismissLoading();
    }
  }

  updateTimes() {
    if (this.has_date) { this.setJob(); }
    this.jobs.forEach((job: any) => {
      job.book.time.forEach((time: string) => {
        const timeOption = this.times.find(t => t.title === time && t.value !== this.job.book.time[0]);
        if (timeOption && job.group_id === (this.group as any).id) {
          (timeOption as any).count = ((timeOption as any).count || 0) + 1;
          if ((timeOption as any).count >= (this.group as any).limit) {
            timeOption.title = timeOption.title + ' (มีคิวแล้ว)';
            timeOption.disabled = true;
          }
        }
        const siteTimeOption = this.times.find(
          t => t.title === time && job.site_id === this.job.site_id && t.value !== this.job.book.time[0]
        );
        if (siteTimeOption) {
          siteTimeOption.title = siteTimeOption.title + ' (มีคิวแล้ว)';
          siteTimeOption.disabled = true;
        }
      });
    });
    this.has_date = true;
    this.initFormJob();
    this.service.dismissLoading();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  submit() {
    switch (this.type) {
      case 'user': this.editUser(); break;
      case 'site': this.editSite(); break;
      case 'group': this.editGroup(); break;
      case 'job': this.editJob(); break;
    }
  }

  async editUser() {
    await this.appUserService.updateUser(this.user.key!, {
      name: this.form.value.name,
      last_name: this.form.value.last_name,
      phone: this.form.value.phone,
      nick_name: this.form.value.nick_name,
      group_id: '',
    });
    this.dismiss();
  }

  async editSite() {
    await this.siteGroupService.updateSite(this.site.key!, {
      name: this.form.value.name,
      group_id: this.form.value.group_id,
    });
    this.dismiss();
  }

  async editGroup() {
    const siteIds: string[] = this.form.value.site_groups.map((s: any) => s.value);
    await this.siteGroupService.updateGroup(this.group.key!, {
      name: this.form.value.name,
      reader: this.form.value.reader,
      limit: this.form.value.limit,
      color: this.form.value.color.value,
      site_groups: { site_id: siteIds },
    });
    await Promise.all(
      this.form.value.site_groups.map((s: any) =>
        this.siteGroupService.updateSiteGroupId(s.key, this.group.id)
      )
    );
    this.dismiss();
  }

  async editJob() {
    const time: string = this.form.value.time.title;
    const hour = parseInt(time.split('.')[0], 10);
    const date = new Date(this.form.value.date).setHours(hour, 0, 0, 0);
    const formatDate = new Date(date);
    await this.jobService.updateJob(this.job.key!, {
      book: { time: [time], date: formatDate },
      address: this.form.value.address,
      phone: this.form.value.phone,
      type: this.form.value.type.title,
      type_other: this.form.value.type.title === 'อื่นๆ' ? this.form.value.type_other : '',
      qty: this.form.value.qty,
      status: this.form.value.status.value,
      remark: this.form.value.remark,
    } as any);
    this.dismiss();
  }

  cancelJob(job: Job) {
    this.service.showAlert('ยืนยัน', 'ยืนยันการยกเลิกงาน', () => {
      this.jobService.updateJob(job.key!, { status: 'CANCELED' });
    }, { confirmOnly: false }).then(result => {
      if (result) { this.dismiss(); }
    });
  }

  rejectJob(job: Job) {
    this.service.showAlert('ยืนยัน', 'ยืนยันการปฏิเสธงาน', () => {
      this.jobService.updateJob(job.key!, { status: 'REJECTED' });
    }, { confirmOnly: false });
  }

  timeChange() {}

  setJob() {
    this.times = ['9.00', '10.00', '11.00', '12.00', '13.00', '14.00', '15.00', '16.00']
      .map(t => ({ title: t, value: t, disabled: false }));
  }

  addQty() {
    if (this.form.value.qty < 10) { this.form.patchValue({ qty: this.form.value.qty + 1 }); }
  }

  subQty() {
    if (this.form.value.qty > 1) { this.form.patchValue({ qty: this.form.value.qty - 1 }); }
  }

  setColor() {
    this.colors = getColor()
      .map(color => ({ title: color.split('-')[1], value: color, disabled: false }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  setSite() {
    this.sites = this.siteGroupService.getSites()
      .map(site => ({ title: site.name, value: site.site_id, disabled: false, key: site.key } as any))
      .sort((a: any, b: any) => a.title.localeCompare(b.title));
  }
}
