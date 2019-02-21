import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { PickingFormPage } from '../picking-form/picking-form';


/**
 * Generated class for the PickingListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-picking-list',
  templateUrl: 'picking-list.html',
})
export class PickingListPage {
  
  picking_types: any
  picking_type_filter: any
  stock_picking_ids: any
  current_picks_ids: any
  ScanReader: FormGroup;
  picking_type_init_filter: any
  default_warehouse: any
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let code 
    code = this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      console.log(val)
      this.scan_read(val)
    })
  
    }

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private storage: Storage, private sound: SoundsProvider, 
        private stockInfo: StockProvider, private formBuilder: FormBuilder, private scanner: ScannerProvider) {
        this.picking_type_filter = 0
        this.picking_type_init_filter = []
        this.get_selected_warehouse()
        this.initPickingTypes()
        //this.initStockPicking();
  }

  filter_picks(picking_type, value){
    this.picking_type_filter = value
    if (picking_type=='type'){
      if (value !=0){
        this.current_picks_ids = this.stock_picking_ids.filter(x => x['picking_type_id'][0]==value)
      }
      else {
        this.current_picks_ids = this.stock_picking_ids
      }
    }
    for (var i in this.current_picks_ids){
      this.current_picks_ids[i]['index'] = i
    }
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad PickingListPage');
  }
 
  change_hide_scan_form() {
    this.scanner.hide_scan_form = !this.scanner.hide_scan_form
  }

  scan_read(val){
    
  }
  
  open_pick(picking_id: number = 0){
    
    let val = {'index': picking_id, 'picking_ids': this.current_picks_ids}
    this.sound.play('nav')
    this.navCtrl.setRoot(PickingFormPage, val)
  }

  get_picking_domain(){
    var domain = []
    if (this.picking_type_filter != 0){
      domain = [['picking_type_id', '=', this.picking_type_filter]]
    }
    domain.push(['state','not in', ['cancel','done', 'draft', 'confirmed']])
   return domain
  }
  
  submitScan(value=false){
    let scan
    if (!this.ScanReader.value['scan']){
      this.sound.startListening()
    }
    scan = value && this.ScanReader.value['scan']
    for (let l in this.stock_picking_ids){
      if (this.stock_picking_ids[l]['name'] == scan){
        this.open_pick(this.stock_picking_ids[l]['id'])
      }}
    this.sound.recon_voice([this.ScanReader.value['scan']])  
    
  }

  initPickingTypes(){
    /* let domain = [['code', '=', 'outgoing']] */
    let domain = [['show_in_pda', '=', true]]
    this.stockInfo.get_picking_types(domain).then((picks)=> {
      this.picking_types = []
      for (var type in picks){
        picks[type]['index'] = type
        this.picking_types.push(picks[type])
        this.picking_type_init_filter.push(picks[type]['id'])
      }

      this.initStockPicking()
    })
    .catch((mierror) => {
      this.picking_types = []
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los pick')
    })
    return
  }

  initStockPicking(){
    var domain = this.get_picking_domain()
    domain.push(['picking_type_id','in',this.picking_type_init_filter])
    domain.push(['company_id', '=', this.default_warehouse])
    this.stockInfo.get_stock_picking(domain).then((picks)=> {
      this.stock_picking_ids = []
      for (var pick in picks){
        picks[pick]['index']=pick
        this.stock_picking_ids.push(picks[pick])
        this.filter_picks('type', this.picking_type_filter)
      }
    })
    .catch((mierror) => {
      this.stock_picking_ids = []
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los pick')
    })
    return
  }

  get_selected_warehouse(){
    this.storage.get('selected_warehouse').then((val) => {
      this.default_warehouse = val
    })
  }
}


