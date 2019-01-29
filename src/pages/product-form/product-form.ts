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
  product_last_movements: {}
  product_last_lots: {}
  product_real_id: any
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let code 
    code = this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.scan_read(val)
    })
  
    }

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private storage: Storage, private sound: SoundsProvider, 
        private productInfo: ProductProvider, private formBuilder: FormBuilder, private scanner: ScannerProvider) {
          this.index = Number(this.navParams.data.index)
          this.max_index = this.navParams.data.product_ids.length
          this.get_product_id(this.index)
  }

  open_pickform(picking_id: number = 0){
    
    let val = {'index': picking_id, 'picking_ids': this.product_last_movements}
    this.sound.play('nav')
    this.navCtrl.setRoot(PickingFormPage, val)
  }

  open_pick(index: number = 0){
    this.index = this.index + Number(index)
    if (this.index >= this.max_index){this.index=0}
    if (this.index < 0 ){this.index=this.max_index-1}
    this.get_product_id(this.navParams.data.product_ids[this.index]['id'])
    this.sound.play('nav')
  }

  open_lotform(lot_id: number = 0){
    
    let val = {'index': lot_id, 'lots_ids': this.product_last_lots}
    this.sound.play('nav')
    this.navCtrl.setRoot(LotFormPage, val)
  }

  get_product_id(id){
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
        domain = [['product_id', '=', real_id[0]['id']]]
        if (this.stock_product_id['tracking'] != "none") {
          this.productInfo.get_last_lots(domain, 'form').then((lots:Array<{}>)=> {
            this.product_last_lots = lots
            console.log(this.product_last_lots)
          })
        }
        this.productInfo.get_last_movements(domain, 'form').then((movements:Array<{}>)=> {
          this.product_last_movements = movements
          for (var i in this.product_last_movements){
            this.product_last_movements[i]['index'] = i
            this.product_last_movements[i]['id'] = this.product_last_movements[i]['picking_id'][0]
          }
        })
      })
    })
    .catch((mierror) => {
      this.stock_product_id = []
      this.productInfo.presentAlert('Error de conexión', 'Error al recuperar el pick')
    })
    return
  }

  scan_read(val){
    //this.odootools.presentToast('Picking form ' + val)
  }

  open_form (model, id){

  }
}


