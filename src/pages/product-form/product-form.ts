import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { ProductProvider } from '../../providers/products/products'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { ProductListPage } from '../product-list/product-list';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { PickingFormPage } from '../picking-form/picking-form';
import { LotFormPage } from '../lot-form/lot-form';
import { StockInventoryFormPage } from '../stock-inventory-form/stock-inventory-form'



/**
 * Generated class for the ProductFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'product-form',
  templateUrl: 'product-form.html',
})
export class ProductFormPage {
  
  @ViewChild('scan') myScan ;
  stock_product_id: {} 
  view_form: boolean
  view_tree: boolean
  index: number
  hide_scan_form: boolean
  max_index: number
  move_model: string
  ScanReader: FormGroup
  product_last_movements: any
  product_last_lots: {}
  product_real_id: any
  id_to_open: any
  last_product_id: any
  first_product_id: any
  current_page: any
  arrow_movement: boolean
  current_inventory_list: any
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.changeDetectorRef.detectChanges()
      switch(val) {
        case "left": {
          if(this.arrow_movement == true) {
            this.open_pick(this.stock_product_id['name'], 0)
            break
          }
        }

        case "right": {
          if(this.arrow_movement == true) {
            this.open_pick(this.stock_product_id['name'], 1)
            break
          }
        }

        case "down": {
          if(this.arrow_movement == true) {
            this.backToProductList()
            break
          }
        }

        case "up": {
          if(this.arrow_movement == true) {
            this.backToProductList()
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

  constructor(private changeDetectorRef: ChangeDetectorRef, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private storage: Storage, private sound: SoundsProvider, 
        private productInfo: ProductProvider, private formBuilder: FormBuilder, private scanner: ScannerProvider) {
          this.index = Number(this.navParams.data.index)
          this.max_index = this.navParams.data.product_ids.length
          this.current_page = this.navParams.data.current_page
          this.get_product_id(this.index)
          this.scanner.on()
          this.arrow_movement = true
          this.current_inventory_list = []
          this.product_last_movements = []

  }

  open_pickform(picking_id: number = 0){
    this.sound.play('nav')
    let val = {'index': picking_id, 'picking_ids': this.product_last_movements}
    this.navCtrl.setRoot(PickingFormPage, val)
  }

  open_inventoryform(inventory_id: number = 0) {
    this.sound.play('nav')
    let val = {'index': inventory_id, 'inventory_ids': this.current_inventory_list, 'type': 'list'}
    this.navCtrl.setRoot(StockInventoryFormPage, val)  
  }

  open_pick(name, option){
    this.sound.play('nav')  
    let val
    this.productInfo.get_next_template_id(name, option).then((valor:Array<{}>) => {
      if(valor.length == 0) {
        if (option == 0) {
          val = {'index': this.last_product_id, 'product_ids': ' ', 'current_page': this.current_page}
          this.changeDetectorRef.detectChanges()
        }
        if (option == 1) {
          val = {'index': this.first_product_id, 'product_ids': ' ', 'current_page': this.current_page}
          this.changeDetectorRef.detectChanges()
        }
      } else {
        val = {'index': valor[0]['id'], 'product_ids': ' ', 'current_page': this.current_page}
        this.changeDetectorRef.detectChanges()
      }
      this.navCtrl.setRoot(ProductFormPage, val)
    })
  }

  open_lotform(lot_id: number = 0){
    this.sound.play('nav')
    let val = {'index': lot_id, 'lots_ids': this.product_last_lots}
    this.navCtrl.setRoot(LotFormPage, val)
  }

  get_product_id(id){
    this.get_last_product()
    this.get_first_product()
    var domain = [['id', '=', id]]
    this.productInfo.get_product_data(domain, 'form', 0, 1).then((picks:Array<{}>)=> {
      this.stock_product_id = picks[0]
      this.stock_product_id['base64'] = true
      if (this.stock_product_id['image_medium'] == false) {
        this.stock_product_id['base64'] = false
        this.storage.get('CONEXION').then((con_data) => {
          this.stock_product_id['image_medium'] = con_data.url + "/web/static/src/img/placeholder.png"
        })
      }
      domain = [['product_tmpl_id', '=', id]]
      this.productInfo.get_product_real_id(domain, 'form').then((real_id:Array<{}>)=> {
        if(real_id) {
          domain = [['product_id', '=', real_id[0]['id']]]
          if (this.stock_product_id['tracking'] != "none") {
            this.productInfo.get_last_lots(domain, 'form').then((lots:Array<{}>)=> {
              this.product_last_lots = lots
            })
          }
          this.productInfo.get_last_movements(domain, 'form').then((movements:Array<{}>)=> {
            movements.forEach(movement => {
              var container = []
              if(movement['picking_id']) {
                container['index'] = this.product_last_movements.length
                container['id'] = movement['picking_id'][0]
                container['reference'] = movement['reference']
                this.product_last_movements.push(container)
                this.changeDetectorRef.detectChanges()
              } else if(movement['inventory_id']) {
                container['index'] = this.current_inventory_list.length
                container['id'] = movement['inventory_id'][0]
                container['reference'] = movement['reference']
                this.current_inventory_list.push(container)
                this.changeDetectorRef.detectChanges()
              } else {
                console.log("No hay movimientos")
              }
              this.changeDetectorRef.detectChanges()

            });
          })
          .catch((mierror) => {
            console.log(mierror)
          })
        }
      })
      .catch((mierror) => {
        console.log(mierror)
      })
      return
    })
    .catch((mierror) => {
      this.stock_product_id = []
      this.productInfo.presentAlert('Error de conexión', 'Error al recuperar el pick')
    })
    return
  }

  get_last_product() {
    this.productInfo.get_last_product_id().then((result) => {
      this.last_product_id = result[0]['id']
      this.changeDetectorRef.detectChanges()
    })
    .catch((mierror) => {
      this.last_product_id = []
      this.productInfo.presentAlert('Error de conexión', 'Error al recuperar los pick')
    })
  }
  
  get_first_product() {
    this.productInfo.get_first_product_id().then((result) => {
      this.first_product_id = result[0]['id']
      this.changeDetectorRef.detectChanges()
    })
    .catch((mierror) => {
      this.first_product_id = []
      this.productInfo.presentAlert('Error de conexión', 'Error al recuperar los pick')
    })
  }

  submitScan(value: any):void {
    /* El submit para las pruebas sin pistola. */
    if(value.scan) {
      this.scan_read(value.scan)
    }
    this.changeDetectorRef.detectChanges()
  }

  check_scan(scan){
    return true
  }

  scan_read(val){
    //this.stockInfo.check_barcode_or_lot(val, this.stock_picking_id['id'])
  }

  toggle_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
    this.arrow_movement = !this.arrow_movement
    this.changeDetectorRef.detectChanges()
  }

  open_form (model, id){

  }

  backToProductList() {
    let val = {'actual_page': this.current_page}
    this.navCtrl.setRoot(ProductListPage, val)
  }
}


