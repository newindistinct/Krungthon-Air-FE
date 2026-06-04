import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SettingAddComponent } from 'src/app/components/modals/setting-add/setting-add.component';
import { SettingEditComponent } from 'src/app/components/modals/setting-edit/setting-edit.component';
import { ShowQrCodeComponent } from '../../show-qr-code/show-qr-code.component';
import { SiteGroupService } from 'src/app/services/site-group.service';
import { ServiceService } from 'src/app/services/service.service';
import { Site } from 'src/app/data/models';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss'],
})
export class SiteComponent implements OnInit, OnDestroy {
  search: string = '';
  data: Site[] = [];
  results: Site[] = [];

  private subscription!: Subscription;

  constructor(
    private serviceService: ServiceService,
    private modalController: ModalController,
    private siteGroupService: SiteGroupService
  ) {}

  ngOnInit() {
    this.subscription = this.siteGroupService.sitesChange.subscribe(sites => {
      this.data = sites;
      this.results = [...sites];
      this.serviceService.dismissLoading();
    });

    if (this.siteGroupService.sites.length > 0) {
      this.data = this.siteGroupService.sites;
      this.results = [...this.data];
    } else {
      this.serviceService.presentLoadingWithOutTime('กําลังโหลดข้อมูล...');
      this.siteGroupService.fetchSites(environment.defaultProjectId);
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
      componentProps: { type: 'site' },
    }).then(modal => modal.present());
  }

  edit(site: Site) {
    this.modalController.create({
      component: SettingEditComponent,
      componentProps: { type: 'site', site },
      cssClass: 'my-custom-class',
    }).then(modal => modal.present());
  }

  showQrCode(site: Site) {
    this.modalController.create({
      component: ShowQrCodeComponent,
      cssClass: 'my-custom-class',
      componentProps: { site },
    }).then(modal => modal.present());
  }
}
