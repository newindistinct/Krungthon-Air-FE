import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  public appPages = [
    // { title: 'Inbox', url: '/krungthon/folder/inbox', icon: 'mail' },
    // { title: 'Outbox', url: '/krungthon/folder/outbox', icon: 'paper-plane' },
    // { title: 'Favorites', url: '/krungthon/folder/favorites', icon: 'heart' },
    // { title: 'Archived', url: '/krungthon/folder/archived', icon: 'archive' },
    // { title: 'Trash', url: '/krungthon/folder/trash', icon: 'trash' },
    // { title: 'Spam', url: '/krungthon/folder/spam', icon: 'warning' },
    { title: 'home', url: '/krungthon/home', icon: 'home' },
    { title: 'dashboard', url: '/krungthon/dashboard', icon: 'home' },
    { title: 'ผู้ใช้งาน', url: '/krungthon/user', icon: 'person-circle' },
    { title: 'ตารางงาน', url: '/krungthon/job-schedule', icon: 'person-circle' },
    { title: 'ทีมงาน', url: '/krungthon/work-group', icon: 'document' },
    { title: 'ตั้งค่า', url: '/krungthon/setting', icon: 'person-circle' },
  ];
  constructor(
    private authService: AuthService,
    private service: ServiceService,
    private firestoreService: FirestoreService,
  ) { }
  async ngOnInit() {
    // await disableNetwork(db);
    this.service.presentLoadingWithOutTime('Loading...');
    const isLogedIn = await this.authService.SessionIsLogedIn();
    if (isLogedIn == true) {
      await this.authService.checkAuth().then((res) => {
        if (res == true) {
          const UserFormAuth = this.authService.getUserFormAuth();
          const phone = this.formatPhoneNumber(UserFormAuth.phoneNumber);
          this.service.dismissLoading();
          this.firestoreService.fetchDataUser(phone).then(async (users) => {
            if (users.length > 0) {
              const site = await this.firestoreService.fetchDataSite(users[0].project_id);
              const group = await this.firestoreService.fetchDataGroup(users[0].project_id);
            }
          });
        } else {
        }
      });
    } else {
    }
  }
  formatPhoneNumber(phoneNumber: any) {
    if (phoneNumber.length === 12 && phoneNumber.startsWith("+66")) {
      return "0" + phoneNumber.substring(3);
    } else if (phoneNumber.length === 10 && phoneNumber.startsWith("0")) {
      return phoneNumber;
    }
  }
}