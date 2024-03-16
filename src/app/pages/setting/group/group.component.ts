import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SettingAddComponent } from 'src/app/components/modals/setting-add/setting-add.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
})
export class GroupComponent implements OnInit {
  search: any
  public data = [];
  public results = [...this.data];

  subscription;

  constructor(
    private serviceService: ServiceService,
    private modalController: ModalController,
    private firestoreService: FirestoreService
  ) { }

  ngOnInit() {
    this.serviceService.presentLoadingWithOutTime('กําลังโหลดข้อมูล...');
    const interval = setInterval(() => {
      if (this.firestoreService.user.length > 0) {
        clearInterval(interval);
        this.firestoreService.fetchDataGroup(this.firestoreService.user[0].project_id)
      }
    }, 1000);
    this.subscription = this.firestoreService.groupsChange.subscribe(groups => {
      this.serviceService.dismissLoading();
      this.data = groups;
      this.results = [...this.data];
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  handleInput(event) {
    const query = event.target.value.toLowerCase();
    this.results = this.data.filter((d) => d.name.toLowerCase().indexOf(query) > -1);
  }

  onActivate(event) {
    if (event.type === "click") {
      console.log(event.row)
    }
  }

  add() {
    this.modalController.create({
      component: SettingAddComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        type: 'group'
      }
    }).then(modal => modal.present());
  }

  edit(user) {
    console.log(user);
  }
}
