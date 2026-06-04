import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';
import { AppUserService } from 'src/app/services/app-user.service';
import { SiteGroupService } from 'src/app/services/site-group.service';
import { getColor } from 'src/app/data/interfaces/color';
import { AppUser, Group, SelectOption, Site } from 'src/app/data/models';

@Component({
  selector: 'app-setting-add',
  templateUrl: './setting-add.component.html',
  styleUrls: ['./setting-add.component.scss'],
})
export class SettingAddComponent implements OnInit {
  @Input() type!: string;
  title = '';
  form!: FormGroup;
  sites: SelectOption[] = [];
  colors: SelectOption[] = [];

  constructor(
    private appUserService: AppUserService,
    private siteGroupService: SiteGroupService,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.initialize();
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
        this.title = 'เพิ่มกลุ่ม';
        this.setColor();
        this.setSite();
        this.initFormGroup();
        break;
    }
  }

  initFormUser() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      nick_name: ['', Validators.required],
      phone: ['', Validators.required],
    });
  }

  initFormSite() {
    this.form = this.formBuilder.group({ name: ['', Validators.required] });
  }

  initFormGroup() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      reader: [''],
      limit: [''],
      color: [''],
      image: [''],
      site_groups: [''],
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  submit() {
    switch (this.type) {
      case 'user': this.addUser(); break;
      case 'site': this.addSite(); break;
      case 'group': this.addGroup(); break;
    }
  }

  async addUser() {
    const projectId = this.appUserService.user[0].project_id;
    const data: Omit<AppUser, 'key'> = {
      name: this.form.value.name,
      last_name: this.form.value.last_name,
      nick_name: this.form.value.nick_name,
      phone: this.form.value.phone,
      user_id: uuidv4(),
      project_id: projectId,
      group_id: '',
    };
    await this.appUserService.addUser(data);
    this.dismiss();
  }

  async addSite() {
    const projectId = this.appUserService.user[0].project_id;
    const data: Omit<Site, 'key'> = {
      name: this.form.value.name,
      site_id: uuidv4(),
      project_id: projectId,
      group_id: '',
    };
    await this.siteGroupService.addSite(data);
    this.dismiss();
  }

  async addGroup() {
    const groupId = uuidv4();
    const siteIds: string[] = this.form.value.site_groups.map((s: any) => s.value);
    const projectId = this.appUserService.user[0].project_id;

    const data: Omit<Group, 'key'> = {
      name: this.form.value.name,
      reader: this.form.value.reader,
      limit: this.form.value.limit,
      color: this.form.value.color.value,
      image: this.form.value.image,
      site_groups: { site_id: siteIds },
      id: groupId,
      project_id: projectId,
    };

    await this.siteGroupService.addGroup(data);

    await Promise.all(
      this.form.value.site_groups.map((site: any) =>
        this.siteGroupService.updateSiteGroupId(site.key, groupId)
      )
    );
    this.dismiss();
  }

  setColor() {
    this.colors = getColor()
      .map(color => ({ title: color.split('-')[1], value: color, disabled: false }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  async setSite() {
    const rawSites = await this.siteGroupService.fetchSiteNoGroup();
    this.sites = rawSites
      .map(site => ({ title: site.name, value: site.site_id, disabled: false, key: site.key } as any))
      .sort((a: any, b: any) => a.title.localeCompare(b.title));
  }
}
