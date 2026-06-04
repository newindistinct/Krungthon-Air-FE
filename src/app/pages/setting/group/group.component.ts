import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SettingAddComponent } from 'src/app/components/modals/setting-add/setting-add.component';
import { SettingEditComponent } from 'src/app/components/modals/setting-edit/setting-edit.component';
import { SiteGroupService } from 'src/app/services/site-group.service';
import { AppUserService } from 'src/app/services/app-user.service';
import { ServiceService } from 'src/app/services/service.service';
import { Group } from 'src/app/data/models';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
})
export class GroupComponent implements OnInit, OnDestroy {
  search: string = '';
  data: Group[] = [];
  results: Group[] = [];

  private subscription!: Subscription;

  constructor(
    private serviceService: ServiceService,
    private modalController: ModalController,
    private siteGroupService: SiteGroupService,
    private appUserService: AppUserService
  ) {}

  ngOnInit() {
    this.subscription = this.siteGroupService.groupsChange.subscribe(groups => {
      this.data = groups;
      this.results = [...groups];
      this.serviceService.dismissLoading();
    });

    if (this.siteGroupService.groups.length > 0) {
      this.data = this.siteGroupService.groups;
      this.results = [...this.data];
    } else {
      this.serviceService.presentLoadingWithOutTime('กําลังโหลดข้อมูล...');
      this.siteGroupService.fetchGroups(this.appUserService.user[0].project_id);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onActivate(event: any) {}

  handleInput(event: any) {
    const query = event.target.value.toLowerCase();
    this.results = this.data.filter(d => d.name.toLowerCase().includes(query));
  }

  add() {
    this.modalController.create({
      component: SettingAddComponent,
      cssClass: 'my-custom-class',
      componentProps: { type: 'group' },
    }).then(modal => modal.present());
  }

  edit(group: Group) {
    this.modalController.create({
      component: SettingEditComponent,
      componentProps: { type: 'group', group },
      cssClass: 'my-custom-class',
    }).then(modal => modal.present());
  }
}
