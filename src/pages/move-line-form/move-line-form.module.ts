import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoveLineFormPage } from './move-line-form';

@NgModule({
  declarations: [
    MoveLineFormPage,
  ],
  imports: [
    IonicPageModule.forChild(MoveLineFormPage),
  ],
})
export class MoveLineFormPageModule {}
