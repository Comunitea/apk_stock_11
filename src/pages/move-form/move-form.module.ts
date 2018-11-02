import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoveFormPage } from './move-form';

@NgModule({
  declarations: [
    MoveFormPage,
  ],
  imports: [
    IonicPageModule.forChild(MoveFormPage),
  ],
})
export class MoveFormPageModule {}
