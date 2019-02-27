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
 * Generated class for the StockInventoryFormNewLinePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'stock-inventory-form-new-line',
  templateUrl: 'stock-inventory-form-new-line.html',
})
export class StockInventoryFormNewLinePage {
  @ViewChild('scan') myScan ;

  cargar: boolean
  hide_scan_form: boolean
  ScanReader: FormGroup
  valores: any
  todayDate: any
  dateToday: any
  arrow_movement: any
  inventory_id: any
  inventory_line: any
  warehouse_error: boolean
  warehouse_confirm: boolean
  lot_error: boolean
  pkg_error: boolean
  product_error: boolean
  lot_confirm: boolean
  pkg_confirm: boolean
  product_confirm: boolean
  qty_mod: any
  qty_confirm: boolean
  qty_error: boolean
  step: any
  initial_warehouse: any
  product_name: any
  product_barcode: any
  possible_quants: any
  last_code: any
  location_name: any
  lot_name: any
  pkg_name: any
  product_qty: any
  last_qty: any
  previous_line_error: boolean
  previous_line_confirm: boolean
  tracking: any
  pkg_quants: any
  pkg_quants_ids: any
  unconfirmed_quants: any

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.changeDetectorRef.detectChanges()
      switch(val) {

        case "down": {
          if(this.arrow_movement == true) {
            this.move_to_inventory(this.inventory_id)
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
    this.arrow_movement = true
    this.warehouse_error = false
    this.warehouse_confirm = false
    this.lot_error = false
    this.pkg_error = false
    this.product_error = false
    this.lot_confirm = false
    this.pkg_confirm = false
    this.product_confirm = false
    this.qty_mod = false
    this.qty_confirm = false
    this.qty_error = false
    this.product_name = false
    this.product_barcode = false
    this.possible_quants = false
    this.last_code = false
    this.location_name = false
    this.lot_name = false
    this.pkg_name = false
    this.product_qty = false
    this.last_qty = false
    this.tracking = false
    this.pkg_quants = false
    this.pkg_quants_ids = false
    this.unconfirmed_quants = false
    this.step = 0
    this.get_inventory_data()
  }

  get_inventory_data() {
    this.inventory_id = this.navParams.data.inventory_id
    this.initial_warehouse = this.navParams.data.warehouse_id
    
    this.inventory_line = {
      'inventory_id': this.inventory_id,
      'product_id': undefined,
      //'product_uom_id': undefined,
      'product_qty': undefined,
      'location_id': undefined,
      'package_id': undefined,
      'prod_lot_id': undefined,
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StockInventoryFormNewLinePage');
  }
  
  check_scan(scan){
    return true
  }

  scan_read(val){

    this.lot_error = false
    this.pkg_error = false
    this.product_error = false
    this.qty_error = false
    this.warehouse_error = false
    this.previous_line_error = false
    this.previous_line_confirm = false

    switch(this.step) {

      case 0: {

        this.stockInfo.check_if_package_in_warehouse(val, this.initial_warehouse).then((lines:Array<{}>) => {
          
          if(lines[0]) {

            this.pkg_name = lines[0]['name']
            this.inventory_line['package_id'] = lines[0]['id']
            this.location_name = lines[0]['location_id'][1]
            this.inventory_line['location_id'] = lines[0]['location_id'][0]
            this.pkg_quants_ids = lines[0]['quant_ids']
            this.changeDetectorRef.detectChanges()

            if(this.pkg_quants_ids.length > 0) {

              this.pkg_confirm = true
              this.warehouse_confirm = true
              this.lot_confirm = true
              this.product_confirm = true

              this.stockInfo.get_quants_info(this.pkg_quants_ids).then((lines:Array<{}>) => {
                
                let k = 0
                this.pkg_quants = lines
                lines.forEach(line => {
                  this.pkg_quants[k] = {
                    'inventory_id': this.inventory_id,
                    'product_id': line['product_id'][0],
                    'product_name': line['product_id'][1],
                    'product_qty': undefined,
                    'location_id': line['location_id'][0],
                    'package_id': line['package_id'][0],
                    'prod_lot_id': line['lot_id'][0],
                    'lot_name': line['lot_id'][1],
                    'theo_qty': line['quantity'] - line['reserved_quantity'],
                    'tracking': line['product_tracking']
                  }
                  k++
                  this.changeDetectorRef.detectChanges()
                });

                this.unconfirmed_quants = this.pkg_quants.filter(x=> x['product_qty'] == undefined)
                this.changeDetectorRef.detectChanges()
              })
              
              this.step = 3

            } else {

              this.pkg_name = undefined
              this.inventory_line['package_id'] = undefined
              this.location_name = undefined
              this.inventory_line['location_id'] = undefined
              this.lot_name = undefined
              this.inventory_line['prod_lot_id'] = undefined
              this.product_name = undefined
              this.inventory_line['product_id'] = undefined
              this.tracking = undefined

              this.warehouse_error = true
              this.changeDetectorRef.detectChanges()

            }

          } else {

            this.stockInfo.get_possible_locations(this.initial_warehouse, val, 'form').then((lines:Array<{}>) => {

              if(lines[0]) {
                this.warehouse_confirm = true
                this.inventory_line['location_id'] = lines[0]['id']
                this.location_name = lines[0]['name']
                this.step++
                this.changeDetectorRef.detectChanges()
              } else {
                this.warehouse_error = true
                this.changeDetectorRef.detectChanges()
              }
            })

          }
        })

        break
      }

      case 1: {

        this.stockInfo.check_if_production_lot(val).then((lines:Array<{}>) => {
          if(lines[0]){

            this.lot_name = lines[0]['name']
            this.inventory_line['prod_lot_id'] = lines[0]['id']
            this.product_name = lines[0]['product_short_name']
            this.inventory_line['product_id'] = lines[0]['product_id'][0]
            this.tracking = lines[0]['product_tracking']
            
            this.stockInfo.get_available_quants(this.inventory_line['location_id'], this.inventory_line['product_id'], this.inventory_line['prod_lot_id'], undefined, true).then((quants:Array<{}>) => {

              if(quants[0]) {

                this.lot_confirm = true
                this.product_confirm = true

                this.possible_quants = quants
                this.product_qty = quants[0]['qty']
                this.step = 2
                this.changeDetectorRef.detectChanges()

              } else {

                this.lot_name = undefined
                this.inventory_line['prod_lot_id'] = undefined
                this.product_name = undefined
                this.inventory_line['product_id'] = undefined
                this.tracking = undefined

                this.check_product_by_barcode(val)
              }
              
            })

          } else {
            
            this.check_product_by_barcode(val)

          }
        })
        break
      }

      case 2: {

        this.confirm_qty_before_insert(val, 2)
        break
      }

      case 3: {

        this.confirm_qty_before_insert(val, 3)

      }

    }

  }

  confirm_qty_before_insert(val, step) {
    if(!this.last_qty) {
      this.reset_last_qty(val, step)
    } else {
      if(this.last_qty == val) {

        if(step == 2) {
          this.inventory_line['product_qty'] = val
          this.qty_confirm = true
          this.changeDetectorRef.detectChanges()
          this.send_inventory_line(2, false)
        }

        if(step == 3) {
          this.unconfirmed_quants[0]['product_qty'] = val
          this.changeDetectorRef.detectChanges()
          this.send_inventory_line(3, this.unconfirmed_quants.length)
        }        

      } else {
        this.reset_last_qty(val, step)
        this.qty_error = true
        this.changeDetectorRef.detectChanges()
      }
    }
  }

  check_product_by_barcode(val) {
    this.stockInfo.get_product_by_barcode(val).then((lines:Array<{}>) => {
      if(lines.length > 0) {
        this.stockInfo.get_available_quants(this.inventory_line['location_id'], this.inventory_line['product_id'], undefined, undefined, true).then((quants:Array<{}>) => {
          
          if(quants[0]) {

            this.inventory_line['product_id'] = quants[0]['id']
            this.product_name = quants[0]['product_tmpl_name']
            this.tracking = quants[0]['tracking']
            this.product_confirm = true
            this.step++
            this.possible_quants = quants
            this.changeDetectorRef.detectChanges()
            
          } else {

            this.inventory_line['product_id'] = lines[0]['id']
            this.product_name = lines[0]['product_tmpl_id']
            this.tracking = lines[0]['tracking']
            this.product_confirm = true
            this.step++

            this.changeDetectorRef.detectChanges()

          }
        })

        this.changeDetectorRef.detectChanges()

      } else {
        this.product_error = true
        this.changeDetectorRef.detectChanges()
      }
    })
  }

  reset_last_qty(val, step){

    let type

    if(step == 2) {
      type = this.tracking
    } else {
      type = this.unconfirmed_quants[0]['product_tracking']
    }    

    if(type == 'serial' && val > 1) {
      this.last_qty = 1
      this.qty_error = true
      this.changeDetectorRef.detectChanges()
    } else {
      this.last_qty = val
      this.changeDetectorRef.detectChanges()
    }
  }

  check_vals(val, val2) {
    if(val == val2) {
      return true
    } else {
      return false
    }
  }

  turn_to_confirmed() {
    this.lot_confirm = true
    this.pkg_confirm = true
    //this.check_inventory_data_before_confirm()
  }


  send_inventory_line(step, last) {

    let new_line

    if(step == 2) {
      new_line = this.inventory_line
    } else {
      new_line = this.unconfirmed_quants[0]
    }

    this.stockInfo.inventory_line_create(new_line).then((lines:Array<{}>) => {
      if(lines) {
        this.previous_line_confirm = true
        this.changeDetectorRef.detectChanges()
        if(step == 2) {
          this.new_inventory_line()
        } else {
          this.last_qty = false
          this.unconfirmed_quants = this.unconfirmed_quants.filter(x=> x['product_qty'] == undefined)
          if(last == 1) {
            this.new_inventory_line()
            this.unconfirmed_quants = false
          }
          this.changeDetectorRef.detectChanges()
        }
        
      } else {
        this.previous_line_error = true
      }
    }).catch((mierror) => {
      this.stockInfo.presentAlert('Error de conexión', mierror)
      this.cargar=false
    })

  }

  check_inventory_data_before_confirm() {

    if(this.inventory_line['prod_lot_id'] == undefined && this.possible_quants[0]['lot_id']['id']) {
      this.inventory_line['prod_lot_id'] = this.possible_quants[0]['lot_id']['id']
      this.changeDetectorRef.detectChanges()
    }

    if(this.inventory_line['package_id'] == undefined && this.possible_quants[0]['package_id']['id']) {
      this.inventory_line['package_id'] = this.possible_quants[0]['package_id']['id']
      this.changeDetectorRef.detectChanges()
    }

    this.product_qty = this.possible_quants[0]['qty']
    this.changeDetectorRef.detectChanges()
  }
  
  submitScan(value: any):void {
    /* El submit para las pruebas sin pistola. */
    if(value.scan) {
      this.scan_read(value.scan)
    }
    this.changeDetectorRef.detectChanges()
  }

  new_inventory_line() {
    this.sound.play('nav')
    let val = {'inventory_id': this.inventory_id, 'warehouse_id': this.initial_warehouse}
    this.navCtrl.setRoot(StockInventoryFormNewLinePage, val)  
  }

  move_to_inventory(id) {
    this.sound.play('nav')
    let val = {'index': id, 'inventory_ids': '', 'type': 'new'}
    this.navCtrl.setRoot(StockInventoryFormPage, val)    
  }

}
