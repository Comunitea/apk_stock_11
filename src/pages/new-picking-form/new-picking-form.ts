import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { PickingListPage } from '../picking-list/picking-list';
import { PickingFormPage } from '../picking-form/picking-form';
import { MoveFormPage } from '../move-form/move-form'
import { MoveLineFormPage } from '../move-line-form/move-line-form'
import { StockMoveListPage } from '../stock-move-list/stock-move-list'
import { resolveDefinition } from '@angular/core/src/view/util';

/**
 * Generated class for the NewPickingFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'new-page-picking-form',
  templateUrl: 'new-picking-form.html',
})
export class NewPickingFormPage {
  @ViewChild('scan') myScan ;

  
  hide_scan_form: boolean
  ScanReader: FormGroup
  arrow_movement: boolean
  move_data: any
  step: any
  move_model: any
  location_error: boolean
  location_dest_error: boolean
  product_error: boolean
  qty_error: boolean
  last_step: any
  location_confirm: boolean
  location_dest_confirm: boolean
  location_data: any
  location_dest_data: any
  product_data: any
  available_qty: any
  product_uom_qty: any
  qty_confirm: boolean
  qty_done: any
  default_warehouse: any
  picking_id: any
  picking_array: any
  
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.changeDetectorRef.detectChanges()
      switch(val) {

        case "down": {
          if(this.arrow_movement == true) {
            this.backToMoveList()
            break
          }
        }

        case "up": {
          if(this.arrow_movement == true) {
            this.backToMoveList()
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

  constructor(private storage: Storage, private changeDetectorRef: ChangeDetectorRef, public navCtrl: NavController, public navParams: NavParams, private sound: SoundsProvider, public formBuilder: FormBuilder, private stockInfo: StockProvider, public scanner: ScannerProvider, public alertCtrl: AlertController) {
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.scanner.on()
    this.arrow_movement = true
    this.move_data = []
    this.step = 0
    this.picking_array = []
    this.get_selected_warehouse()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewPickingFormPage');
  }
  
  check_scan(scan){
    return true
  }

  scan_read(val){
    this.location_error = false
    this.location_dest_error = false
    this.product_error = false
    this.qty_error = false

    console.log(this.step)

    switch (this.step) {

      case 0: {
          
        /* Comprobamos que se ha introducido un código de barras de localización */
        this.stockInfo.check_if_location_barcode(val).then((lines:Array<{}>) => {
          console.log(lines[0])
          if(lines.length > 0) {
            this.location_data = lines[0]
            if(lines[0]['need_check']) {
              this.last_step = this.step
              this.location_confirm = true
              this.step = 'confirm'
              this.changeDetectorRef.detectChanges()
            } else {
              this.step++
              this.changeDetectorRef.detectChanges()
            }
          } else {
            this.location_error = true
            this.changeDetectorRef.detectChanges()
          }
        })
        break

      }

      case 1: {
        this.product_data == false
        this.product_error == false
        this.available_qty == false

        /* Comprobamos que se haya introducido un producto */
        this.stockInfo.get_product_by_barcode(val).then((lineas:Array<{}>) => {
          console.log(lineas[0])
          if(lineas.length > 0) {
            this.product_data = lineas[0]
            this.step++

            /* Obtenemos la cantidad disponible */
            this.stockInfo.get_available_qty(this.location_data['id'], this.product_data['id']).then((avail_qty: number) => {
              this.available_qty = avail_qty
              this.changeDetectorRef.detectChanges()
            })
            .catch((error) => {
              this.product_error = true
              this.product_data = false
              this.step = 1
              this.changeDetectorRef.detectChanges()
            })
            this.changeDetectorRef.detectChanges()
          } else {
            this.product_error = true
            this.changeDetectorRef.detectChanges()
          }
        })
        break
      }

      case 2: {

        /* Pedimos la cantidad demandada */
        this.check_real_uom_qty(val)
        this.changeDetectorRef.detectChanges();
        break

      }

      case 3: {

        /* Comprobamos que la ubicación no sea la misma */
        if(this.check_vals(val, this.location_data['barcode'])) {
          this.location_dest_error = true
          this.changeDetectorRef.detectChanges()
        } else {
          /* Comprobamos que se ha introducido un código de barras de localización */
          this.stockInfo.check_if_location_barcode(val).then((lines:Array<{}>) => {
            if(lines.length > 0) {
              this.location_dest_data = lines[0]
              console.log(this.location_dest_data)
              if(lines[0]['need_dest_check']) {
                this.last_step = this.step
                this.location_dest_confirm = true
                this.step = 'confirm'
                this.changeDetectorRef.detectChanges()
              } else {
                this.step++
                this.changeDetectorRef.detectChanges()
                this.update_picking(this.location_dest_data['id'])
              }
            } else {
              this.location_dest_error = true
              this.changeDetectorRef.detectChanges()
            }
          })
        }
        break

      }

      case 'confirm': {

        var val2
        
        if(this.last_step == 0) {
          val2 = this.location_data['barcode']
        }

        if(this.last_step == 3) {
          val2 = this.location_dest_data['barcode']
        }

        if(this.check_vals(val, val2)) {
          this.step = this.last_step+1
          this.location_confirm = false
          this.location_dest_confirm = false
          this.changeDetectorRef.detectChanges()
          if(this.last_step == 3){
            this.update_picking(this.location_dest_data['id'])
          }
        } else {
          this.step = this.last_step
          if(this.step == 0) {
            this.location_data = false
            this.location_error = true
            this.location_confirm = false
            this.changeDetectorRef.detectChanges()
          } else if(this.step == 3) {
            this.location_dest_data = false
            this.location_error = true
            this.location_dest_confirm = false
            this.changeDetectorRef.detectChanges()
          }
        } 
        break      

      }

    }
  }

  move_lines_to_real_dest_location() {
    var domain = [['picking_id', '=', this.picking_id]]
    this.stockInfo.get_stock_move_lines_simple(domain, 'tree', 'stock.move.line').then((lines:Array<{}>) => {
      console.log(lines)
      lines.forEach(line => {
        this.stockInfo.new_location_dest(this.location_dest_data['id'], this.location_dest_data['barcode'], line['id']).then((done) => {
          console.log(done)
        }).catch((error) => {
          console.log(error)
        })
      })
    })
    .catch((error) => {
      console.log(error)
    })
    this.open_picking_form()
  }

  update_picking(location_dest_id){
    this.stockInfo.update_dest(location_dest_id, 'stock.picking', this.picking_id).then((result)=> {
      if(result) {
        this.stockInfo.confirm_picking(this.picking_id).then((confirm_result) => {
          if(confirm_result) {
            this.move_lines_to_real_dest_location()
          }
        }).catch((error) => {
          console.log(error)
        })
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  createPicking(){
    this.stockInfo.get_picking_type_from_warehouse(this.default_warehouse).then((lineas:Array<{}>) => {
      if(lineas) {
        var picking_type_id = lineas[0]['id']

          var values = {
            'picking_type_id': picking_type_id,
            'move_type': 'direct',
            'location_id': this.location_data['id'],
            'location_dest_id': this.location_data['id']
          }
          this.stockInfo.create_new_picking(values).then((result) => {
            this.picking_id = result
            this.changeDetectorRef.detectChanges()
            this.create_move(result)
          }).catch((error) => {
            console.log(error)
          })
      } else {
        return false
      }
    }).catch((mierror) => {
      this.stockInfo.presentAlert('Error de conexión', 'No existe ningún tipo de operación de transferencia interna para este almacén.')
    })
  }


  create_move(picking_id) {

    var stock_move_data = {
      'name': this.product_data['product_tmpl_id'][1],
      'location_id': this.location_data['id'],
      'product_id': this.product_data['id'],
      'product_uom_qty': this.product_uom_qty,
      'qty_done': this.product_uom_qty,
      'procure_method': 'make_to_stock',
      'location_dest_id': this.location_data['id'],
      'picking_id': picking_id
    }

    this.stockInfo.create_stock_move(stock_move_data).then((lineas:Array<{}>) => {
      if(lineas) {
        this.move_data.push(stock_move_data)
        this.changeDetectorRef.detectChanges()
      }
    }).catch((error) => {
      console.log(error)
    })

  }


  check_real_uom_qty(val){
    if(val <= this.available_qty) {
      this.product_uom_qty = val
      if(!this.picking_id){
        this.createPicking()
      } else {
        this.create_move(this.picking_id)
      }
      
      this.step = 1
      this.changeDetectorRef.detectChanges();
    } else {
      this.qty_error = true
    }
  }

  check_vals(val, val2) {
    if(val == val2) {
      return true
    } else {
      return false
    }
  }
  
  submitScan(value: any):void {
    /* El submit para las pruebas sin pistola. */
    if(value.scan) {
      this.scan_read(value.scan)
    }
    this.changeDetectorRef.detectChanges()
  }

  backToMoveList() {
    this.navCtrl.setRoot(StockMoveListPage)
  }

  toggle_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
    this.arrow_movement = !this.arrow_movement
    this.changeDetectorRef.detectChanges()
  }

  get_selected_warehouse(){
    this.storage.get('selected_warehouse').then((val) => {
      this.default_warehouse = val
    })
  }

  changeStep(val){
    this.step = Number(val)
  }

  open_picking_form() {
    this.sound.play('nav')
    var picking_list = {
      'id': this.picking_id
    }
    this.picking_array.push(picking_list)
    let val = {'index': 0, 'picking_ids': this.picking_array}
    this.navCtrl.setRoot(PickingFormPage, val)
  }

}
