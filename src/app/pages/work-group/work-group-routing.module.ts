import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkGroupPage } from './work-group.page';

const routes: Routes = [
  {
    path: '',
    component: WorkGroupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkGroupPageRoutingModule {}
