import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddJobComponent } from 'src/app/pages/add-job/add-job.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { JobsListComponent } from '../jobs-list/jobs-list.component';

@Component({
  selector: 'app-work-group',
  templateUrl: './work-group.component.html',
  styleUrls: ['./work-group.component.scss'],
})
export class WorkGroupComponent implements OnInit {
  groups: any = [];
  teams = [
    {
      group_id: 1,
      site_id: 1,
      title: 'team 1',
      subtitle: 'ผู้รับผิดชอบ',
      description: 'คอนโด 1,คอนโด 2,คอนโด 3,คอนโด 4',
      img: 'https://ionicframework.com/docs/img/demos/card-media.png',
      url: '/krungthon/home'
    },
    {
      group_id: 2,
      site_id: 1,
      title: 'team 2',
      subtitle: 'ผู้รับผิดชอบ',
      description: 'คอนโด 1,คอนโด 2,คอนโด 3,คอนโด 4',
      img: 'https://ionicframework.com/docs/img/demos/card-media.png',
      url: '/krungthon/home'
    },
    {
      group_id: 3,
      site_id: 1,
      title: 'team 3',
      subtitle: 'ผู้รับผิดชอบ',
      description: 'คอนโด 1,คอนโด 2,คอนโด 3,คอนโด 4',
      img: 'https://ionicframework.com/docs/img/demos/card-media.png',
      url: '/krungthon/home'
    },
    {
      group_id: 4,
      site_id: 1,
      title: 'team 4',
      subtitle: 'ผู้รับผิดชอบ',
      description: 'คอนโด 1,คอนโด 2,คอนโด 3,คอนโด 4',
      img: 'https://ionicframework.com/docs/img/demos/card-media.png',
      url: '/krungthon/home'
    },
    {
      group_id: 5,
      site_id: 1,
      title: 'team 5',
      subtitle: 'ผู้รับผิดชอบ',
      description: 'คอนโด 1,คอนโด 2,คอนโด 3,คอนโด 4',
      img: 'https://ionicframework.com/docs/img/demos/card-media.png',
      url: '/krungthon/home'
    },
    {
      group_id: 6,
      site_id: 1,
      title: 'team 6',
      subtitle: 'ผู้รับผิดชอบ',
      description: 'คอนโด 1,คอนโด 2,คอนโด 3,คอนโด 4',
      img: 'https://ionicframework.com/docs/img/demos/card-media.png',
      url: '/krungthon/home'
    },
    {
      group_id: 7,
      site_id: 1,
      title: 'team 7',
      subtitle: 'ผู้รับผิดชอบ',
      description: 'คอนโด 1,คอนโด 2,คอนโด 3,คอนโด 4',
      img: 'https://ionicframework.com/docs/img/demos/card-media.png',
      url: '/krungthon/home'
    }
  ]
  constructor(
    private firestoreService: FirestoreService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    // this.getTeam()
  }

  editTeam(team) {
  }

  showTeamDetail(team) {
  }

  addTeam() {
    this.teams.push({
      group_id: 7,
      site_id: 1,
      title: 'team 7',
      subtitle: 'ผู้รับผิดชอบ',
      description: 'คอนโด 1,คอนโด 2,คอนโด 3,คอนโด 4',
      img: 'https://ionicframework.com/docs/img/demos/card-media.png',
      url: '/krungthon/home'
    });
  }

  getTeam() {
    this.groups = this.firestoreService.getGroup();
  }

  // openModalAddGroup(){
  //   this.modalController.create({
  //     component: AddGroupComponent,
  //     cssClass: 'my-custom-class',
  //   }).then(modal => modal.present());
  // }

  openModalAddJob(group) {
    this.modalController.create({
      component: AddJobComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        group: group
      }
    }).then(modal => modal.present());
  }

  async jobsList(group) {
    await this.firestoreService.fetchDataJobByGroup(group).then((jobs) => {
      this.modalController.create({
        component: JobsListComponent,
        cssClass: 'my-custom-class',
        componentProps: {
          jobs: jobs
        }
      }).then(modal => modal.present());
    });
  }
}