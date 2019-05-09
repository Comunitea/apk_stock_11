import { Component, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Events } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { FormBuilder, FormGroup } from '@angular/forms';
import { HostListener } from '@angular/core';
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { StockInventoryPage } from '../stock-inventory/stock-inventory';
import { StockInventoryFormPage } from '../stock-inventory-form/stock-inventory-form';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the StockInventoryCreatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'stock-inventory-create',
  templateUrl: 'stock-inventory-create.html',
})
export class StockInventoryCreatePage {
  @ViewChild('scan') myScan ;

  model: any
  promiseDone: boolean
  ScanReader: FormGroup
  hide_scan_form: boolean
  scan_check: boolean
  arrow_movement: boolean
  step: any
  // flags
  location_confirm: boolean
  location_error: boolean
  product_confirm: boolean
  product_error: boolean
  lot_pkg_confirm: boolean
  lot_pkg_error: boolean
  product_qty_confirm: boolean
  product_qty_error: boolean
  // data
  inventory_move: any
  product_barcode: any
  last_location_read: any


  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.scan_read(val) 
    })
  }

  constructor(private storage: Storage, private changeDetectorRef: ChangeDetectorRef, public events: Events, private zone: NgZone, public navCtrl: NavController, public navParams: NavParams, private stockInfo: StockProvider, public alertCtrl: AlertController, public fb: FormBuilder, public scanner: ScannerProvider, private sound: SoundsProvider, public formBuilder: FormBuilder ) {
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.model = Number(this.navParams.data.model)
    this.step = 0
    this.arrow_movement = true
    this.scanner.on()
    this.scan_check = false
    // flags
    this.location_confirm = false
    this.location_error = false
    this.product_confirm = false
    this.product_error = false
    this.lot_pkg_confirm = false
    this.lot_pkg_error = false
    this.product_qty_confirm = false
    this.product_qty_error = false
    // data
    this.inventory_move = []
    this.inventory_move['filter'] = false
    this.inventory_move['location_id'] = {}
    this.inventory_move['product_id'] = {}
    this.inventory_move['package_id'] = {}
    this.inventory_move['lot_id'] = {}
    this.inventory_move['move_lines'] = {}
    this.inventory_move['name'] = false
    this.inventory_move['company_id'] = false
    this.get_selected_warehouse()
    this.product_barcode = false
    this.inventory_move['date'] = new Date().toLocaleDateString();
    this.last_location_read = false
  }

  get_selected_warehouse(){
    this.storage.get('selected_warehouse').then((val) => {
      this.inventory_move['company_id'] = val
      this.changeDetectorRef.detectChanges()
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StockInventoryCreatePage');
    this.changeDetectorRef.detectChanges()
  }

  scan_read(val){
    console.log(val)

    switch (this.step) {
      case 0: {
        this.location_error = false

        this.stockInfo.check_if_location_barcode(val).then((lines:Array<{}>) => {
          if(lines.length > 0) {
            this.inventory_move['location_id'] = {
              0: lines[0]['id'],
              1: lines[0]['name']
            }
            this.last_location_read = val
            this.location_confirm = true
            this.step++
            this.changeDetectorRef.detectChanges()
          } else {
            this.location_error = true
            this.changeDetectorRef.detectChanges()
          }
        })
        break
      }

      case 1: {
        this.product_error = false

        if(val == this.last_location_read ) {
          this.product_confirm = true
          this.lot_pkg_confirm = true
          this.inventory_move['filter'] = 'partial'
          this.step+2
          this.changeDetectorRef.detectChanges()

          this.check_before_action()
          break
        }

        this.stockInfo.get_product_by_barcode(val).then((lines:Array<{}>) => {
          if(lines.length > 0) {
            this.inventory_move['product_id'] = {
              0: lines[0]['id'],
              1: lines[0]['product_tmpl_name']
            }
            this.product_barcode = val
            this.product_confirm = true
            this.step++
            this.stockInfo.get_available_quants(this.inventory_move['location_id'][0], this.inventory_move['product_id'][0]).then((lines:Array<{}>) => {
              this.inventory_move['move_lines'] = lines
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
        this.lot_pkg_error = false
        /* Si repite lectura del código de barras es que no quiere introducir paquete o lote */

        if (val == this.product_barcode) {
          this.lot_pkg_confirm = true
          this.inventory_move['filter'] = 'product'
          this.step++
          this.changeDetectorRef.detectChanges()
        } else {
          /* Filtramos los resultados según el código introducido */
          this.pkg_or_lot_filter(val)
          this.changeDetectorRef.detectChanges()
        }

        this.check_before_action()

        break
      }

    }
  }

  submitScan(value: any):void {
    /* El submit para las pruebas sin pistola. */
    if(value.scan) {
      this.scan_read(value.scan)
    }
    this.changeDetectorRef.detectChanges()
  }

  toggle_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
    this.arrow_movement = !this.arrow_movement
    this.changeDetectorRef.detectChanges()
  }

  backToInventoryPage() {
    /* Volvemos al listado inicial. */
    this.navCtrl.setRoot(StockInventoryPage)
    this.changeDetectorRef.detectChanges()
  }

  pkg_or_lot_filter(val) {
    /* Comprobamos primero si se corresponde con algún paquete, si no hay paquetes con ese código entonces buscamos lotes */
    var filtrados = this.inventory_move['move_lines'].filter(x => x['package_id']['name']==val)
 
    if (filtrados.length > 0) {
      this.inventory_move['move_lines'] = filtrados
      this.inventory_move['package_id'] = {
        0: filtrados[0]['package_id']['id'],
        1: val
      }
      this.inventory_move['filter'] = 'pack'
      this.step++
      this.lot_pkg_confirm = true
      this.changeDetectorRef.detectChanges()
    } else {
      var filtrados = this.inventory_move['move_lines'].filter(x => x['lot_id']['name']==val)

      if(filtrados.length > 0) {
        this.inventory_move['move_lines'] = filtrados
        this.inventory_move['lot_id'] = {
          0: filtrados[0]['lot_id']['id'],
          1: val
        }
        this.inventory_move['filter'] = 'lot'
        this.step++
        this.lot_pkg_confirm = true
        this.changeDetectorRef.detectChanges()
      } else {
        this.lot_pkg_error = true
        this.changeDetectorRef.detectChanges()
      }
    }
  }

  check_before_action() {
    if(this.location_confirm && this.product_confirm && this.lot_pkg_confirm) {

      /* Rellenamos automáticamente el nombre del ajuste según el tipo de ajuste que sea. */
      switch (this.inventory_move['filter']) {

        /* Hay que hacer el action_start */

        case 'product': {
          this.inventory_move['name'] = this.inventory_move['location_id'][1] + "/product/" + this.inventory_move['product_id'][1] + "/" + this.inventory_move['date']
          var domain = [['location_id', '=', this.inventory_move['location_id'][0]], ['product_id', '=', this.inventory_move['product_id'][0]], ['filter', '=', 'product'], '|', ['state', '=', 'draft'], ['state', '=', 'confirm']]
          this.check_if_inventory_exists(domain)
          break
        }

        case 'pack': {
          this.inventory_move['name'] = this.inventory_move['location_id'][1] + "/pack/" + this.inventory_move['package_id'][1] + "/" + this.inventory_move['date']
          this.inventory_move['product_id'] = {}
          var domain = [['location_id', '=', this.inventory_move['location_id'][0]], ['package_id', '=', this.inventory_move['package_id'][0]], ['filter', '=', 'pack'], '|', ['state', '=', 'draft'], ['state', '=', 'confirm']]
          this.check_if_inventory_exists(domain)
          break
        }

        case 'lot': {
          this.inventory_move['name'] = this.inventory_move['location_id'][1] + "/lot/" + this.inventory_move['lot_id'][1] + "/" + this.inventory_move['date']
          this.inventory_move['product_id'] = {}
          var domain = [['location_id', '=', this.inventory_move['location_id'][0]], ['lot_id', '=', this.inventory_move['lot_id'][0]], ['filter', '=', 'lot'], '|', ['state', '=', 'draft'], ['state', '=', 'confirm']]
          this.check_if_inventory_exists(domain)
          break
        }

        case 'partial': {
          this.inventory_move['name'] = this.inventory_move['location_id'][1] + "[" + new Date().getTime() + "]"
          this.inventory_move['product_id'] = {}
          var domain = [['location_id', '=', this.inventory_move['location_id'][0]], ['filter', '=', 'partial'], '|', ['state', '=', 'draft'], ['state', '=', 'confirm']]
          this.check_if_inventory_exists(domain)
          break
        }

      }
      
      this.changeDetectorRef.detectChanges()
      console.log(this.inventory_move)

    }
  }

  check_if_inventory_exists (domain) {
    /* Si ya existe un inventario en borrador o en proceso se va a ese inventario */
    this.stockInfo.get_inventory_movements(domain, 'tree').then((lines:Array<{}>) => {
      if(lines[0]){
        this.move_to_inventory(lines[0]['id'])
      } else {
        if(this.inventory_move['name']) {
          this.stockInfo.inventory_action_create(this.inventory_move).then((lines) => {
            if(lines != 0) {
              this.move_to_inventory(lines)
            }
          })
        }
      }
    })
  }

  move_to_inventory(id) {
    this.sound.play('nav')
    let val = {'index': id, 'inventory_ids': '', 'type': 'new'}
    this.navCtrl.setRoot(StockInventoryFormPage, val)    
  }


}
