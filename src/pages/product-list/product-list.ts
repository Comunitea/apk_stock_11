import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ProductProvider } from '../../providers/products/products'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { ProductFormPage } from '../product-form/product-form';


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
    
  }

  toggle_scan_form() {
    this.scanner.hide_scan_form = !this.scanner.hide_scan_form
    this.arrow_movement = !this.arrow_movement
    this.changeDetectorRef.detectChanges()
  }

  open_pick(product_id: number = 0){
   
    this.sound.play('nav')
    let val = {'index': product_id, 'product_ids': this.current_product_ids, 'current_page': this.actual_page}
    this.navCtrl.setRoot(ProductFormPage, val)

  }

  get_product_domain(){
    var domain = [['type', '=', 'product']]
    if (this.product_type_filter != 0){
      domain = [['type', '=', this.product_type_filter]]
    }
   return domain
  }

  submitScan(value=false){
    let scan
    if (!this.ScanReader.value['scan']){
      this.sound.startListening()
    }
    scan = value && this.ScanReader.value['scan']
    for (let l in this.stock_product_ids){
      if (this.stock_product_ids[l]['name'] == scan){
        this.open_pick(this.stock_product_ids[l]['id'])
      }}
    this.sound.recon_voice([this.ScanReader.value['scan']])  
    
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


