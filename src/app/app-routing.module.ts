import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoggedInGuard } from './common/guards/logged-in.guard';
import { MainLayoutComponent } from './components/layouts/main-layout/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { JobScheduleComponent } from './pages/job-schedule/job-schedule.component';
import { SettingComponent } from './pages/setting/setting.component';
import { UserComponent } from './pages/user/user.component';
import { WorkGroupComponent } from './pages/work-group/work-group.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'krungthon/home',
    pathMatch: 'full'
  },
  {
    path: 'krungthon',
    component: MainLayoutComponent,
    children: [
      {
        path: 'folder/:id',
        loadChildren: () => import('./folder/folder.module').then(m => m.FolderPageModule)
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'login',
        loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
      },
      {
        path: 'register',
        loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
      },
      {
        path: 'work-group',
        component: WorkGroupComponent
      },
      {
        path: 'user',
        component: UserComponent
      },
      {
        path: 'job-schedule',
        component: JobScheduleComponent
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'setting',
        component: SettingComponent
      },
    ],
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
    canActivate: [LoggedInGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
