import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ProductProvider } from '../../providers/products/products'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { ProductFormPage } from '../product-form/product-form';
import { isDifferent } from '@angular/core/src/render3/util';


/**
 * Generated class for the ProductListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'product-list',
  templateUrl: 'product-list.html',
})
export class ProductListPage {
  
  product_types: any
  product_type_filter: any
  stock_product_ids: any
  current_product_ids: any
  ScanReader: FormGroup;
  actual_page: number
  total_products: any
  total_pages: any
  arrow_movement: boolean
  hide_scan_form: boolean
  current_id: any
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.changeDetectorRef.detectChanges()
      switch(val) {
        case "left": {
          if(this.arrow_movement == true) {
            this.prev_page()
            break
          }
        }

        case "right": {
          if(this.arrow_movement == true) {
            this.next_page()
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
        this.ScanReader = this.formBuilder.group({scan: ['']});
        this.product_type_filter = 0
        this.actual_page = 0
        this.checkActualPage()
        this.initStockProduct(this.actual_page);   
        this.scanner.on()
        this.arrow_movement = true     
  }

  filter_picks(product_type, value){
    this.product_type_filter = value
    if (product_type=='type'){
      if (value !=0){
        this.current_product_ids = this.stock_product_ids.filter(x => x['type'][0]==value)
      }
      else {
        this.current_product_ids = this.stock_product_ids
      }
    }
    for (var i in this.current_product_ids){
      this.current_product_ids[i]['index'] = i
    }
  }

  checkActualPage() {
    if (this.navParams.data.actual_page) {
      this.actual_page = this.navParams.data.actual_page
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProductListPage');
  }
 
  scan_read(val){
    this.productInfo.get_product_by_barcode(val).then((lineas:Array<{}>) => {
      if(lineas) {
        var id = lineas[0]['product_tmpl_id'][0]
        this.open_pick(id, 0)
      }
    }).catch((mierror) => {
      console.log(mierror)
      this.stock_product_ids = []
      this.productInfo.presentAlert('Error de conexión', 'Error al recuperar los pick')
    })
  }

  toggle_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
    this.arrow_movement = !this.arrow_movement
    this.changeDetectorRef.detectChanges()
  }

  open_pick(product_id: number = 0, type=1){

    if(type==1){
      this.sound.play('nav')
      let val = {'index': product_id, 'product_ids': this.current_product_ids, 'current_page': this.actual_page}
      this.navCtrl.setRoot(ProductFormPage, val)
    } else {
      this.sound.play('nav')
      this.current_product_ids = [product_id]
      let val = {'index': product_id, 'product_ids': this.current_product_ids, 'current_page': 0}
      this.navCtrl.setRoot(ProductFormPage, val)
    }

  }

  get_product_domain(){
    var domain = [['type', '=', 'product']]
    if (this.product_type_filter != 0){
      domain = [['type', '=', this.product_type_filter]]
    }
   return domain
  }

  submitScan(value: any):void {
    /* El submit para las pruebas sin pistola. */
    if(value.scan) {
      this.scan_read(value.scan)
    }
    this.changeDetectorRef.detectChanges()
  }

  initStockProduct(val){
    this.get_total()
    var domain = this.get_product_domain()
    this.productInfo.get_product_data(domain, 'tree', val, 50).then((picks)=> {
      this.stock_product_ids = []
      for (var pick in picks){
        picks[pick]['index']=pick
        this.stock_product_ids.push(picks[pick])
        this.filter_picks('type', this.product_type_filter)
      }
    })
    .catch((mierror) => {
      this.stock_product_ids = []
      this.productInfo.presentAlert('Error de conexión', 'Error al recuperar los pick')
    })
    return
  }

  get_total() {
    this.productInfo.get_total_products().then((result) => {
      this.total_products = result
      this.total_pages = Math.floor(this.total_products / 50)
      this.changeDetectorRef.detectChanges()
    })
    .catch((mierror) => {
      this.stock_product_ids = []
      this.productInfo.presentAlert('Error de conexión', 'Error al recuperar los pick')
    })
  }

  prev_page() {
    this.actual_page -= 1
    if(this.actual_page < 0) {
      this.actual_page = this.total_pages
    }
    this.initStockProduct(this.actual_page)
  }

  next_page() {
    this.actual_page += 1
    if(this.actual_page > this.total_pages) {
      this.actual_page = 0
    }
    this.initStockProduct(this.actual_page)
  }
}


