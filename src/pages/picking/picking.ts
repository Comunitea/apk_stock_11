import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HostListener } from '@angular/core';
/**
 * Generated class for the PickingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import { FormBuilder, FormGroup } from '@angular/forms';
import { HomePage } from '../home/home'
import { OdooToolsProvider } from '../../providers/odoo-tools/odoo-tools'
import { OdooScannerProvider } from '../../providers/odoo-scanner/odoo-scanner'
import { OdooConnectorProvider } from '../../providers/odoo-connector/odoo-connector';
import { LoginPage } from '../login/login';
import { PickingFormPage } from '../picking-form/picking-form';
import { Storage } from '@ionic/storage';

import { OdooStockPickingProvider } from '../../providers/odoo-stock-picking/odoo-stock-picking';



@IonicPage()
@Component({
  selector: 'page-picking',
  templateUrl: 'picking.html',
})
export class PickingPage {

  ScanReader: FormGroup;
  home: HomePage;
  picking_types
  picking_states
  picking_type_filter = 0 // numero
  stock_picking_ids
  currentPicks
  stock_picking_filter  // estado
  stock_picking_obj
  user_pickings: true
  type_header
  picking_state_filter
  conexion = {
    url: '',
    port: '',
    db: '',
    username: '',
    password: '',
    user: '',
    logged: false,
    uid: 0
  };
  hide_scan_form: boolean
  cargar: Boolean
  active_conexion
  need_refresh: Boolean = false
  icon_state: string

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let code 
    code = this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      console.log(val)
      this.scan_read(val)
    })
  
    }

  constructor(public StockPicking: OdooStockPickingProvider, public odoo: OdooConnectorProvider, public navCtrl: NavController, private formBuilder: FormBuilder, public navParams: NavParams, public odootools: OdooToolsProvider, public scanner: OdooScannerProvider, public storage: Storage) {
    
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.scanner.on()
    this.hide_scan_form = false
    this.need_refresh = true
    this.user_pickings = true
    this.stock_picking_filter =[]
    this.type_header=false
    this.icon_state = 'mood'
    

    this.storage.get('odoo_conexion').then((val) => {
      if (val) {
        this.conexion = val
        this.odoo.get_conexion(val).then((conn)=>{
          if (conn){
            this.active_conexion = conn
            this.get_picking_types()
            this.get_stock_picking()
          }
          else{
            this.navCtrl.setRoot(LoginPage)
          }
        })
      }
      else {
        console.log("Sin Conexion. Pagina de login")
        this.navCtrl.setRoot(LoginPage)
      }
      
      })
    this.cargar=false
    
  }
  find_name(val, element){
    return element['name'].search(val)>0
  }
  getItems(ev) {
    if (!ev){
      this.currentPicks = this.stock_picking_ids;
      return
    }
    let val = ev.target.value;
    if (!val || !val.trim()) {
      this.currentPicks = this.stock_picking_ids;
      return;

    }
    this.currentPicks = this.stock_picking_ids.filter(element => element['name'].search(val)>0)
  }

  ionViewDidLoad() {
    
  }

  change_hide_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
  }

  scan_read(val){
    this.odootools.presentToast('Picking tree' + val)    
  }

  submitScan(value=false){
    let scan
    scan = value && this.ScanReader.value['scan']
    this.odootools.presentToast(scan)
    }
  
  filter_picking_state(picking, state) {
    return picking['state'] == state
  }
  filter_picks(type, value){
    if (type=='picking_type'){

    }

  }
  get_picking_types(){
    this.storage.get('picking_types').then((val) => {
      if (val && !this.need_refresh) {
        this.picking_types = val
        // this.picking_types = this.odootools.filter_obj(val, 'picking_type', this.picking_type_filter)
      }
      else {
        this.read_picking_types()
      }
      
      })

  }

  get_pickings_domain(domain=[]){

    //Filtro por defecto para los albarnes
    domain.push (this.StockPicking.DEFAULT_DOMAIN)

    //Filtro por tipo de albarán
    if (this.picking_type_filter){
      domain.push(['picking_type_id', '=', this.picking_type_filter])
    }
    else{
      domain.push (['picking_type_id', 'in', this.odootools.get_ids(this.picking_types)])
    }

    //Filtro por usuario
    if (this.user_pickings){
      domain.push (['user_id', '=', this.conexion.uid])
    }

    // Filtro por estados
    if (this.picking_state_filter){
      //domain.push(['state', 'in', this.picking_state_filter])
    }

    return domain
  }
  get_stock_picking(){
    this.storage.get('stock_picking_ids').then((val) => {
      if (val && !this.need_refresh) {
        if (this.picking_type_filter){
          this.stock_picking_ids.filter(picking => picking['picking_type_id'] == this.picking_type_filter)
        }
        else {
          this.stock_picking_ids = val
        }
        this.getItems(false)
        this.cargar=false
      }
      else {
        this.read_stock_picking_ids(this.get_pickings_domain())
      }
    })
  }

  read_picking_types(domain=[])  {
    
    let model = 'stock.picking.type'
    domain.push(['show_in_pda', '=', true])
    let params = {'domain': domain}
    //let picking_types = this.odoo.search_read(this.odoo, model, method, params)
    
    this.active_conexion.search_read(model, domain, [], 0, 0).then((values) =>{
      if (values) {
        this.picking_types = values
        this.storage.set('picking_types', values);
        this.get_stock_picking();
        }
      else{
        this.odootools.presentAlert('Aviso!', 'No se ha recuperado ningún albarán');
        this.cargar=false
      }
      
      })
      .catch(() => {
        this.cargar = false
        this.odootools.presentAlert('Aviso!', 'Error al recuperar los tipos de albarán');
    });	
    console.log(this.picking_types)

  }

  read_stock_picking_ids(domain=[])  {
    
    let model = 'stock.picking'
    let params = {'domain': domain}
    
    //let picking_types = this.odoo.search_read(this.odoo, model, method, params)
    let fields = this.StockPicking.DEFAULT_FIELDS
    this.active_conexion.search_read(model, domain, fields, 0, 0).then((values) =>{
      if (values) {
        this.stock_picking_ids = values
        this.getItems(false)
        this.storage.set('stock_picking_ids', values);
        if (this.need_refresh){
          this.picking_states = values.map((picking) => picking['state']).filter(this.odootools.onlyUnique )}
        this.odootools.presentToast('Se han recuperado ' + values.length + ' albaranes');
        }
      else{
        this.odootools.presentToast('Aviso!: No se ha recuperado ningún albarán');
      }
      this.cargar=false
      })
      .catch(() => {
        this.cargar = false
        this.odootools.presentAlert('Aviso!', 'Error al recuperar los tipos de albarán');
    });	
    console.log(this.stock_picking_ids)
  }
  open_pick(picking_id = false){
    if (!picking_id){return}

    let val = {'picking_id': picking_id}
    this.navCtrl.setRoot(PickingFormPage, val)


  }
}

