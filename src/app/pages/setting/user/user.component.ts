import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SettingAddComponent } from 'src/app/components/modals/setting-add/setting-add.component';
import { SettingEditComponent } from 'src/app/components/modals/setting-edit/setting-edit.component';
import { AppUserService } from 'src/app/services/app-user.service';
import { ServiceService } from 'src/app/services/service.service';
import { AppUser } from 'src/app/data/models';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit, OnDestroy {
  search: string = '';
  data: AppUser[] = [];
  results: AppUser[] = [];

  private subscription!: Subscription;

  constructor(
    private serviceService: ServiceService,
    private modalController: ModalController,
    private appUserService: AppUserService
  ) {}

  ngOnInit() {
    this.subscription = this.appUserService.allUsersChange.subscribe(users => {
      this.data = users;
      this.results = [...users];
      this.serviceService.dismissLoading();
    });

    if (this.appUserService.allUsers.length > 0) {
      this.data = this.appUserService.allUsers;
      this.results = [...this.data];
    } else {
      this.serviceService.presentLoadingWithOutTime('กําลังโหลดข้อมูล...');
      this.appUserService.fetchAllUsers(this.appUserService.user[0].project_id);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onActivate(event: any) {}

  handleInput(event: any) {
    const query = event.target.value.toLowerCase();
    this.results = this.data.filter(d =>
      d.name?.toLowerCase().includes(query) || d.phone.toLowerCase().includes(query)
    );
  }

  add() {
    this.modalController.create({
      component: SettingAddComponent,
      cssClass: 'my-custom-class',
      componentProps: { type: 'user' },
    }).then(modal => modal.present());
  }

  edit(user: AppUser) {
    this.modalController.create({
      component: SettingEditComponent,
      componentProps: { type: 'user', user },
      cssClass: 'my-custom-class',
    }).then(modal => modal.present());
  }
}
