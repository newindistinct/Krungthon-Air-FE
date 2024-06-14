import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { collection, doc } from 'firebase/firestore';
import { getColor } from 'src/app/data/interfaces/color';
import { db } from 'src/app/services/firebase-config';
import { FirestoreService } from 'src/app/services/firestore.service';

import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'app-setting-edit',
  templateUrl: './setting-edit.component.html',
  styleUrls: ['./setting-edit.component.scss'],
})
export class SettingEditComponent implements OnInit {
  @Input() type: string
  @Input() user: any
  @Input() site: any
  @Input() group: any
  @Input() job: any

  title: string
  form: FormGroup
  sites: any[] = []
  colors: any[] = []

  types: any[] = [
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

  statuses: any[] = [
    {
      title: 'รออนุมัติ',
      value: 'PENDING',
      disabled: false
    },
    {
      title: 'รอดำเนินงาน',
      value: 'BOOKED',
      disabled: false
    },
    {
      title: 'สําเร็จ',
      value: 'COMPLETED',
      disabled: false
    },
    {
      title: 'ปฏิเสธ',
      value: 'REJECTED',
      disabled: false
    },
    {
      title: 'ยกเลิก',
      value: 'CANCELED',
      disabled: false
    },
    {
      title: 'หมดอายุ',
      value: 'EXPIRED',
      disabled: false
    },
  ]

  constructor(
    private firestoreService: FirestoreService,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.initialize()
  }

  initialize() {
    switch (this.type) {
      case 'user':
        this.title = 'เพิ่มผู้ใช้';
        this.initFormUser();
        break;
      case 'site':
        this.title = 'เพิ่มโครงการ';
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
        break;
      default:
        break;
    }
  }

  initFormUser() {
    this.form = this.formBuilder.group({
      name: [this.user.name, Validators.required],
      last_name: [this.user.last_name, Validators.required],
      phone: [this.user.phone, Validators.required],
      // user_id: [''],
      // project_id: [''],
      // group_id: ['']
    })
  }

  initFormSite() {
    this.form = this.formBuilder.group({
      name: [this.site.name, Validators.required],
      // site_id: [''],
      // project_id: [''],
      // group_id: ['']
    })
  }

  initFormGroup() {
    this.form = this.formBuilder.group({
      name: [this.group.name, Validators.required],
      reader: [this.group.reader],
      limit: [this.group.limit],
      color: [this.group.color ? this.colors.find(color => color.value === this.group.color) || '' : ''],
      // image: [''],
      // group_id: [''],
      // project_id: [''],
      // site_groups: ['']
    })
  }
  //this.txn.prefix_local ? this.prefixOptions.find(e => e.value === this.txn.prefix_local) || '' : this.txn.ocr_online.FullNameTH ? this.txn.ocr_online.FullNameTH.split(' ')[0] : ''],
  initFormJob() {
    this.form = this.formBuilder.group({
      address: [this.job.address, Validators.required],
      phone: [this.job.phone, Validators.required],
      type: [this.job.type ? this.types.find(type => type.value === this.job.type) || '' : '', Validators.required],
      status: [this.job.status ? this.statuses.find(type => type.value === this.job.status) || '' : '', Validators.required],
      remark: [this.job.remark],
    })
  }

  dismiss() {
    this.modalController.dismiss()
  }

  submit() {
    switch (this.type) {
      case 'user':
        this.editUser();
        break;
      case 'site':
        this.editSite();
        break;
      case 'group':
        this.editGroup();
        break;
      case 'job':
        this.editJob();
        break;
      default:
        break;
    }
  }

  editUser() {
    const collectionRef = doc(db, "users", this.user.key);
    const data = {
      name: this.form.value.name,
      last_name: this.form.value.last_name,
      phone: this.form.value.phone,
      // user_id: uuidv4(),
      // project_id: this.firestoreService.user[0].project_id,
      group_id: '',
    }
    this.firestoreService.updateDatatoFirebase(collectionRef, data).then(() => {
      this.dismiss()
    })
  }

  editSite() {
    const collectionRef = doc(db, "sites", this.site.key);
    const data = {
      name: this.form.value.name,
      // site_id: uuidv4(),
      // project_id: this.firestoreService.user[0].project_id,
      // group_id: '',
    }
    this.firestoreService.updateDatatoFirebase(collectionRef, data).then(() => {
      this.dismiss()
    })
  }

  editGroup() {
    const collectionRef = doc(db, "groups", this.group.key);
    const data = {
      name: this.form.value.name,
      reader: this.form.value.reader,
      limit: this.form.value.limit,
      color: this.form.value.color.value,
      // image: this.form.value.image,
      // project_id: this.firestoreService.user[0].project_id,
    }
    this.firestoreService.updateDatatoFirebase(collectionRef, data).then(() => {
      this.dismiss()
    })
  }

  editJob() {
    const collectionRef = doc(db, "jobs", this.job.key);
    const data = {
      address: this.form.value.address,
      phone: this.form.value.phone,
      type: this.form.value.type.value,
      status: this.form.value.status.value,
      remark: this.form.value.remark,
    }
    this.firestoreService.updateDatatoFirebase(collectionRef, data).then(() => {
      this.dismiss()
    })
  }

  setColor() {
    const colors = getColor()
    colors.forEach((color) => {
      this.colors = [{ title: color.split('-')[1], value: color, disbled: false }, ...this.colors]
      this.colors.sort((a, b) => a.title.localeCompare(b.title))
    })
  }

  async setSite() {
    const sites = await this.firestoreService.fetchDataSiteNoGroup();
    this.sites = sites.map((site) => {
      return { title: site.name, value: site.site_id, disbled: false, key: site.key }
    })
    this.sites.sort((a, b) => a.title.localeCompare(b.title));
  }
}
