import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WarehouseFormPage } from './warehouse-form';

@NgModule({
  declarations: [
    WarehouseFormPage,
  ],
  imports: [
    IonicPageModule.forChild(WarehouseFormPage),
  ],
})
export class WarehouseFormPageModule {}
