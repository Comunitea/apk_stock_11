import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { Storage } from '@ionic/storage';
import { SoundsProvider } from '../../providers/sounds/sounds'
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { StockMoveListPage } from '../stock-move-list/stock-move-list'
import { TitleCasePipe } from '@angular/common';


/**
 * Generated class for the StockMoveFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'stock-move-form',
  templateUrl: 'stock-move-form.html',
})
export class StockMoveFormPage {
  @ViewChild('scan') myScan ;

  cargar: boolean
  hide_scan_form: boolean
  ScanReader: FormGroup
  arrow_movement: boolean
  stock_move_id: number
  new_move_form: boolean
  stock_move_data: any
  step: any
  default_warehouse: any
  location_error: boolean
  location_data: any
  location_confirm: boolean
  location_dest_confirm: boolean
  location_dest_error: boolean
  location_dest_data: any
  last_step: any
  product_data: any
  product_error: boolean
  available_qty: number
  product_uom_qty: number
  qty_confirm: boolean
  qty_done: number
  qty_error: boolean
  stock_moves_list: any
  type: any
  max_moves: any
  move_index: any
  move_line_ids: any
  max_lines_to_change: any
  actual_line_to_change: any
  lines_to_update: any

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.changeDetectorRef.detectChanges()
      switch(val) {
        case "left": {
          if(this.arrow_movement == true && this.type == 'list') {
            this.open_pick(-1)
            break
          }
        }

        case "right": {
          if(this.arrow_movement == true && this.type == 'list') {
            this.open_pick(1)
            break
          }
        }

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
          this.changeDetectorRef.detectChanges()
          break
        }
      }
      
    })
  }

  constructor(private storage: Storage, private changeDetectorRef: ChangeDetectorRef, public navCtrl: NavController, public navParams: NavParams, private sound: SoundsProvider, public formBuilder: FormBuilder, private stockInfo: StockProvider, public scanner: ScannerProvider, public alertCtrl: AlertController) {
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.cargar=true
    this.scanner.on()
    this.arrow_movement = true
    this.stock_move_data = false
    this.new_move_form = false
    this.location_data = false
    this.location_dest_data = false
    this.product_data = false
    this.product_error = false
    this.qty_confirm = false
    this.max_moves = false
    this.move_index = false
    this.actual_line_to_change = 0
    this.lines_to_update = []
    this.type = false
    this.step = 0
    this.last_step = 0
    this.get_selected_warehouse()    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StockMoveFormPage');
  }
  
  check_scan(scan){
    return true
  }

  scan_read(val){
    console.log(val)
    console.log(this.step)

    this.location_error = false
    this.location_dest_error = false
    this.product_error = false
    this.qty_error = false

    if(this.new_move_form == true) {

      switch (this.step) {

        case 0: {
          
          /* Comprobamos que se ha introducido un código de barras de localización */
          this.stockInfo.check_if_location_barcode(val).then((lines:Array<{}>) => {
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

          /* Comprobamos que se haya introducido un producto */
          this.stockInfo.get_product_by_barcode(val).then((lineas:Array<{}>) => {
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
                if(lines[0]['need_dest_check']) {
                  this.last_step = this.step
                  this.location_dest_confirm = true
                  this.step = 'confirm'
                  this.changeDetectorRef.detectChanges()
                } else {
                  this.step++
                  this.changeDetectorRef.detectChanges()
                  this.create_move()
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
              this.create_move()
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
      
    } else {
      if(this.move_line_ids) {

        /* Verificamos la cantidad de cada paso */

        this.check_actual_line()

        if(val <= this.move_line_ids[this.actual_line_to_change]['ordered_qty']) {
          this.lines_to_update.push({
            'id': this.move_line_ids[this.actual_line_to_change]['id'],
            'qty_done': val
          })
          this.move_line_ids[this.actual_line_to_change]['qty_status'] = 'done'
          this.actual_line_to_change++
          this.changeDetectorRef.detectChanges()
        } else {
          this.move_line_ids[this.actual_line_to_change]['qty_status'] = 'error'
          this.changeDetectorRef.detectChanges()
        }

        if(this.actual_line_to_change > this.max_lines_to_change) {
          this.stockInfo.update_qty_lines(this.lines_to_update).then((value) => {
            if(this.type == 'list'){
              this.lines_to_update = []
              this.get_stock_move_data(this.navParams.data.moves_ids[Number(this.move_index)]['id'])
              this.changeDetectorRef.detectChanges()
            } else {
              this.lines_to_update = []
              this.get_stock_move_data(this.stock_move_id)
              this.changeDetectorRef.detectChanges()
            } 
          }).catch((err) => {
            console.log(err)
          });
        }

      }

    }

  }

  check_actual_line() {
    if (this.actual_line_to_change > this.max_lines_to_change) {
      this.actual_line_to_change = 0
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

  get_stock_move_data(id){
    this.stock_move_id = id
    var domain = [['id', '=', id]]
    this.stockInfo.get_stock_move_simple(domain, 'form', 'stock.move').then((lines:Array<{}>)=> {
        this.stock_move_data = lines[0]
        var subdomain = [['move_id', '=', lines[0]['id']]]
        this.stockInfo.get_stock_move_lines_simple(subdomain, 'tree', 'stock.move.line').then((lines:Array<{}>) => {
          this.move_line_ids = lines
          this.max_lines_to_change = this.move_line_ids.length -1
          this.changeDetectorRef.detectChanges();
        })
        this.changeDetectorRef.detectChanges();
    })
    .catch((err) => {
        console.log(err)
    });
  }

  get_selected_warehouse(){

    this.storage.get('selected_warehouse').then((val) => {
      this.default_warehouse = val
      
      if(this.navParams.data.id) {
        if(this.navParams.data.type == 'list'){
          this.move_index = this.navParams.data.id
          this.stock_moves_list = this.navParams.data.moves_ids
          this.type = this.navParams.data.type
          this.stock_move_id = Number(this.navParams.data.moves_ids[this.navParams.data.id]['id'])
          this.max_moves = this.navParams.data.moves_ids.length
        } else {
          this.stock_move_id = Number(this.navParams.data.id)
        }
        this.get_stock_move_data(this.stock_move_id)

      } else {
          this.stock_move_id = 0
          this.new_move_form = true
          this.stock_move_data = false
      }

    })
  }

  check_vals(val, val2) {
    if(val == val2) {
      return true
    } else {
      return false
    }
  }

  check_uom_qty(val) {
    this.product_uom_qty = val
    this.qty_confirm = true
    this.step++
    this.changeDetectorRef.detectChanges();
  }

  check_real_uom_qty(val){
    if(val <= this.available_qty) {
      this.product_uom_qty = val
      this.qty_confirm = true
      this.step++
      this.changeDetectorRef.detectChanges();
    } else {
      this.qty_error = true
    }
  }

  check_done_qty(val) {
    if(val <= this.available_qty) {
      if(this.check_vals(val, this.product_uom_qty)) {
        this.qty_done = val
        this.qty_confirm = false
        this.step ++
        this.changeDetectorRef.detectChanges();
      } else {
        this.qty_error = true
        this.changeDetectorRef.detectChanges();
      }
    } else {
      this.qty_error = true
      this.changeDetectorRef.detectChanges();
    }
  }

  move_all_qty(val){
    /* this.check_uom_qty(val)
    this.check_done_qty(val) */
    this.check_real_uom_qty(val)
    this.changeDetectorRef.detectChanges();
  }

  create_move() {

    var stock_move_data = {
      'name': this.product_data['product_tmpl_id'][1],
      'location_id': this.location_data['id'],
      'product_id': this.product_data['id'],
      'product_uom_qty': this.product_uom_qty,
      'qty_done': this.qty_done,
      'procure_method': 'make_to_stock',
      'location_dest_id': this.location_dest_data['id'],
    }

    this.stockInfo.create_stock_move(stock_move_data).then((lineas:Array<{}>) => {
      let val = {'id': lineas}
      this.navCtrl.setRoot(StockMoveFormPage, val)
    })

  }

  search_quants_apk() {
    this.stockInfo.check_for_move_quants(this.stock_move_id).then((resultado) => {
      this.get_stock_move_data(this.stock_move_id)
      this.changeDetectorRef.detectChanges()    
    }).catch((err) => {
      console.log(err)
    });
  }

  forced_quants_apk() {
    this.stockInfo.force_move_quants(this.stock_move_id).then((resultado) => {
      this.get_stock_move_data(this.stock_move_id)
      this.changeDetectorRef.detectChanges()    
    }).catch((err) => {
      console.log(err)
    });
  }

  validate_move_apk() {
    this.stockInfo.move_validation(this.stock_move_id).then((resultado) => {
      
      this.get_stock_move_data(this.stock_move_id)
      this.changeDetectorRef.detectChanges()
         
    }).catch((error) => {
      this.stockInfo.presentAlert('Error de validación', 'No se ha podido validar el inventario, revisa sus datos.')
      this.cargar=false
      this.navCtrl.setRoot(StockMoveListPage)
    })
  }

  toggle_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
    this.arrow_movement = !this.arrow_movement
    this.changeDetectorRef.detectChanges()
  }

  backToMoveList(){
    this.navCtrl.setRoot(StockMoveListPage)
  }

  open_pick(index: number = 0){
    this.sound.play('nav')
    this.move_index = Number(this.move_index) + Number(index)
    if (this.move_index >= this.max_moves){this.move_index=0}
    if (this.move_index < 0 ){this.move_index=this.max_moves-1}
    this.cargar=true
    this.get_stock_move_data(this.navParams.data.moves_ids[Number(this.move_index)]['id'])
  }

  verificar_qty(line_id) {
    this.stockInfo.line_to_done(line_id).then((resultado) => {
      this.get_stock_move_data(this.stock_move_id)
      this.changeDetectorRef.detectChanges()
    }).catch((err) => {
      console.log(err)
    });
  }

  verificar_all_lines_qty() {
    this.move_line_ids.forEach(move_line => {
      this.verificar_qty(move_line['id'])
    });
    this.get_stock_move_data(this.stock_move_id)
    this.changeDetectorRef.detectChanges()
  }

}