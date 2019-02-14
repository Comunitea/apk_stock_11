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
import { StockInventoryPage } from '../stock-inventory/stock-inventory';
import { StockInventoryFormPage } from '../stock-inventory-form/stock-inventory-form';

/**
 * Generated class for the StockInventoryFormLinePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'stock-inventory-form-line',
  templateUrl: 'stock-inventory-form-line.html',
})
export class StockInventoryFormLinePage {
  @ViewChild('scan') myScan ;

  cargar: boolean
  inventory_line_id: any
  index: number
  hide_scan_form: boolean
  max_index: number
  ScanReader: FormGroup
  valores: any
  todayDate: any
  dateToday: any
  arrow_movement: any
  inventory_id: any
  lot_error: boolean
  pkg_error: boolean
  product_error: boolean
  lot_confirm: boolean
  pkg_confirm: boolean
  product_confirm: boolean
  qty_mod: any
  qty_confirm: boolean
  qty_error: boolean

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.changeDetectorRef.detectChanges()
      switch(val) {
        case "left": {
          if(this.arrow_movement == true) {
            this.open_pick(-1)
            break
          }
        }

        case "right": {
          if(this.arrow_movement == true) {
            this.open_pick(1)
            break
          }
        }

        case "down": {
          if(this.arrow_movement == true) {
            this.move_to_inventory(this.inventory_line_id['inventory_id'][0])
            break
          }
        }

        default: {
          this.scan_read(val)
          break
        }
      }
      
    })
  }
  
  constructor(private changeDetectorRef: ChangeDetectorRef, public navCtrl: NavController, public navParams: NavParams, private sound: SoundsProvider, public formBuilder: FormBuilder, private stockInfo: StockProvider, public scanner: ScannerProvider, public alertCtrl: AlertController) {
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.cargar=true
    this.scanner.on()
    this.index = Number(this.navParams.data.index)
    this.max_index = this.navParams.data.inventory_ids.length
    console.log(this.max_index)
    this.inventory_line_id = []
    this.inventory_id = false
    this.arrow_movement = true
    this.lot_error = false
    this.pkg_error = false
    this.product_error = false
    this.lot_confirm = false
    this.pkg_confirm = false
    this.product_confirm = false
    this.qty_mod = false
    this.qty_confirm = false
    this.qty_error = false
    this.get_inventory_line_id(this.navParams.data.inventory_ids[this.index]['id'])     
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StockInventoryFormLinePage');
  }
  
  check_scan(scan){
    return true
  }

  scan_read(val){

    console.log(val)

    this.lot_error = false
    this.pkg_error = false
    this.product_error = false
    this.qty_error = false

    if(this.qty_mod) {
      if(this.check_vals(val, this.qty_mod)) {
        
        this.stockInfo.update_inventory_line_product_qty(this.inventory_line_id['id'], val).then((lines:Array<{}>) => {
          console.log(lines)
          if(lines) {
            this.changeDetectorRef.detectChanges()
            this.next_or_out()
          }
        })
        .catch((mierror) => {
          this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar las líneas.')
          this.cargar=false
        })
        this.changeDetectorRef.detectChanges()
      } else {
        this.qty_error = true
        this.qty_mod = false
        this.changeDetectorRef.detectChanges()
      }
    } else {
      if(this.inventory_line_id['package_id']) {
        if(this.check_vals(val, this.inventory_line_id['package_id'][1])) {
          this.pkg_confirm = true
          this.changeDetectorRef.detectChanges()
        }
      }
  
      if(this.inventory_line_id['prod_lot_id']) {
        if(this.check_vals(val, this.inventory_line_id['prod_lot_id'][1])) {
          this.lot_confirm = true
          this.changeDetectorRef.detectChanges()
        }
      }
  
      if(!this.pkg_confirm && !this.lot_confirm) {
        if(this.check_vals(val, this.inventory_line_id['product_barcode']) || this.check_vals(val, this.inventory_line_id['product_default_code'])) {
          this.product_confirm = true
          this.changeDetectorRef.detectChanges()
        }
      }

      this.check_confirms(val)

    }

  }


  check_vals(val, val2) {
    if(val == val2) {
      return true
    } else {
      return false
    }
  }

  check_confirms(val) {
    if(this.pkg_confirm || this.lot_confirm || this.product_confirm) {
      this.next_or_out()
    } else if(Number(val) && !this.qty_mod) {
      this.qty_mod = val
      this.changeDetectorRef.detectChanges()
    } else {
      this.lot_error = true
      this.pkg_error = true
      this.product_error = true
      this.changeDetectorRef.detectChanges()
    }
  }
  
  submitScan(value: any):void {
    /* El submit para las pruebas sin pistola. */
    if(value.scan) {
      this.scan_read(value.scan)
    }
    this.changeDetectorRef.detectChanges()
  }

  open_pick(index: number = 0){
    this.sound.play('nav')
    this.index = this.index + Number(index)
    if (this.index >= this.max_index){this.index=0}
    if (this.index < 0 ){this.index=this.max_index-1}
    this.cargar=true
    this.get_inventory_line_id(this.navParams.data.inventory_ids[this.index]['id'])
  }

  get_inventory_line_id(id){
    this.lot_error = false
    this.pkg_error = false
    this.product_error = false
    this.lot_confirm = false
    this.pkg_confirm = false
    this.product_confirm = false
    this.qty_mod = false
    this.qty_confirm = false
    this.qty_error = false

    this.stockInfo.get_inventory_line_info(id, 'form').then((lines:Array<{}>)=> {  

      this.set_line_data(lines[0])
      this.changeDetectorRef.detectChanges()

    })
    .catch((mierror) => {
      console.log(mierror)
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar el pick')
      this.cargar=false
    })

    return
  }

  next_or_out() {
    let next_line = this.index + 1
    if(next_line >= this.max_index) {
      this.move_to_inventory(this.inventory_line_id['inventory_id'][0])
    } else {
      this.open_pick(1)
    }
  }

  set_line_data(move_data) {
    this.inventory_line_id = move_data
    this.changeDetectorRef.detectChanges()

    console.log(this.inventory_line_id)
  }

  move_to_inventory(id) {
    this.sound.play('nav')
    let val = {'index': id, 'inventory_ids': '', 'type': 'new'}
    this.navCtrl.setRoot(StockInventoryFormPage, val)    
  }

}
