import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PickingListPage } from './picking-list';

@NgModule({
  declarations: [
    PickingListPage,
  ],
  imports: [
    IonicPageModule.forChild(PickingListPage),
  ],
})
export class PickingListPageModule {}
