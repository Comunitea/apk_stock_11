import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HostListener } from '@angular/core';
/**
 * Generated class for the PickingFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import { OdooToolsProvider } from '../../providers/odoo-tools/odoo-tools'
import { OdooScannerProvider } from '../../providers/odoo-scanner/odoo-scanner'
import { OdooConnectorProvider } from '../../providers/odoo-connector/odoo-connector';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import { BottomBadgeComponent } from '../../components/bottom-badge/bottom-badge'
import { MoveLineComponent } from '../../components/move-line/move-line'
import { OdooStockPickingProvider } from '../../providers/odoo-stock-picking/odoo-stock-picking';

@IonicPage()
@Component({
  selector: 'page-picking-form',
  templateUrl: 'picking-form.html',
})
export class PickingFormPage {
  
  ScanReader: FormGroup;
  picking: {}
  picking_id
  moves
  filter_moves
  conexion
  active_conexion
  cargar: boolean 
  home = LoginPage;
  hide_scan_form: boolean
  header: boolean
  need_refresh: boolean = false

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
    this.header = true
    this.filter_moves = 'T'
    this.hide_scan_form = true
    this.picking_id= this.navParams.data.picking_id
    this.storage.get('odoo_conexion').then((val) => {
      if (val) {
        this.conexion = val
        this.odoo.get_conexion(val).then((conn)=>{
          if (conn){
            this.active_conexion = conn
            this.get_stock_picking(this.picking_id)
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
    this.cargar=true
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PickingFormPage');
  }

  change_hide_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
  }

  change_header() {
    this.header = !this.header
  }

  scan_read(val){
    this.odootools.presentToast('Picking form ' + val)    
  }


  reorder_moves(){
    if (!this.moves){
      return
    }
    
    this.cargar = true
    var ops = []
    ops = this.moves
    var len1 = ops.length -1
    var new_picks = []
    var index = 0
    for (var op in ops) {
      index = len1 - Number(op)
      new_picks.push(ops[index])
    }
    this.moves = new_picks
    this.cargar = false

  }
  onchange_filter_moves(){
    this.moves = this.get_moves_to_show()
  }
  get_moves_to_show(){
    let moves = this.picking['moves']
    if (this.filter_moves =="T"){
      return moves
    }
    else if (this.filter_moves=='P'){
      return moves.filter(move => !move.pda_done)
      }
    else if (this.filter_moves=='R'){
      return moves.filter(move => move.pda_done)
    }
    return moves

  }

  get_stock_picking(id=false){
    if (!id){
      id = this.picking_id
      }
    else {
      this.picking_id = id
    }
    let model = 'stock.picking'
    let values = {'picking_id': id}
    //let picking_types = this.odoo.search_read(this.odoo, model, method, params)
    this.odoo.execute(model, 'get_picking_pda', values).then((res) =>{
      if (res) {
        this.picking = res
        this.moves = this.get_moves_to_show()

        
        this.cargar=false
        //this.getItems(false)
        this.odootools.presentToast('Se han recuperado los movimeintos ' + res);
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
    console.log(this.picking)
  }

}
