import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PickingPage } from './picking';

@NgModule({
  declarations: [
    PickingPage,
  ],
  imports: [
    IonicPageModule.forChild(PickingPage),
  ],
  
})
export class PickingPageModule {}
