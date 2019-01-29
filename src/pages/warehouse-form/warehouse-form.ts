import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { PickingListPage } from '../picking-list/picking-list';
import { MoveFormPage } from '../move-form/move-form'
import { MoveLineFormPage } from '../move-line-form/move-line-form'

/**
 * Generated class for the PickingFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@IonicPage()
@Component({
  selector: 'page-warehouse-form',
  templateUrl: 'warehouse-form.html',
})

export class WarehouseFormPage {
  @ViewChild('scan') myScan ;

  warehouse_id: any
  model: any
  id: any
  index: any
  picking_ids: any
  index_lines: any
  next_line: any
  lines_ids: any
  picking_type: any
  ScanReader: FormGroup
  hide_scan_form: boolean
  scan_check: boolean

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.scan_read(val)
    })
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, private stockInfo: StockProvider, public alertCtrl: AlertController, public fb: FormBuilder, public scanner: ScannerProvider, private sound: SoundsProvider, public formBuilder: FormBuilder ) {
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.model = Number(this.navParams.data.model)
    this.warehouse_id = this.navParams.data.warehouse_id
    this.id = this.navParams.data.id
    this.index = this.navParams.data.index
    this.picking_ids = this.navParams.data.picking_ids
    this.next_line = this.navParams.data.next_line
    this.index_lines = this.navParams.data.index_lines
    this.lines_ids = this.navParams.data.lines_ids
    this.get_warehouse_data(this.warehouse_id)
    
    this.scanner.on()
    this.scan_check = false
    
    
   

  }

  get_warehouse_data(id) {

  }


  scan_read(val){}


}