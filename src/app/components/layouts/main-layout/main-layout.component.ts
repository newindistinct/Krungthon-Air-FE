import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  public appPages = [
    { title: 'Inbox', url: '/krungthon/folder/inbox', icon: 'mail' },
    { title: 'Outbox', url: '/krungthon/folder/outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/krungthon/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/krungthon/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/krungthon/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/krungthon/folder/spam', icon: 'warning' },
  ];
  constructor() { }
  ngOnInit() { }

}
