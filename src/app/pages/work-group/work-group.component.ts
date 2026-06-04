import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AddJobComponent } from 'src/app/pages/work-group/add-job/add-job.component';
import { JobsListComponent } from '../jobs-list/jobs-list.component';
import { SettingEditComponent } from 'src/app/components/modals/setting-edit/setting-edit.component';
import { SiteGroupService } from 'src/app/services/site-group.service';
import { JobService } from 'src/app/services/job.service';
import { Group, Site } from 'src/app/data/models';

@Component({
  selector: 'app-work-group',
  templateUrl: './work-group.component.html',
  styleUrls: ['./work-group.component.scss'],
})
export class WorkGroupComponent implements OnInit {
  groups: Group[] = [];

  constructor(
    private siteGroupService: SiteGroupService,
    private jobService: JobService,
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    const interval = setInterval(() => {
      const groups = this.siteGroupService.getGroups();
      if (groups.length > 0) {
        this.groups = groups;
        clearInterval(interval);
      }
    }, 1000);
  }

  openModalAddJob(group: Group) {
    this.modalController.create({
      component: AddJobComponent,
      cssClass: 'my-custom-class',
      componentProps: { group },
    }).then(modal => modal.present());
  }

  async jobsList(group: Group) {
    const jobs = await this.jobService.fetchJobsByGroup(group);
    this.modalController.create({
      component: JobsListComponent,
      cssClass: 'my-custom-class',
      componentProps: { jobs },
    }).then(modal => modal.present());
  }

  edit(group: Group) {
    this.modalController.create({
      component: SettingEditComponent,
      componentProps: { type: 'group', group },
      cssClass: 'my-custom-class',
    }).then(async modal => {
      await modal.present();
      await modal.onDidDismiss().then(() => {
        this.groups = this.siteGroupService.getGroups();
      });
    });
  }

  bookingPage(site: Site) {
    this.router.navigate(['booking', site.key], { queryParams: { is_admin: 'true' } });
  }
}
