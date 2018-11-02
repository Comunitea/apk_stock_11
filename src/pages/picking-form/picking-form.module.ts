import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PickingFormPage } from './picking-form';


@NgModule({
  declarations: [
    PickingFormPage,
  ],
  imports: [
    IonicPageModule.forChild(PickingFormPage),
  ],
})
export class PickingFormPageModule {}
