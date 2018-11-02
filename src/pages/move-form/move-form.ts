import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HostListener } from '@angular/core';
/**
 * Generated class for the MoveFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import { ActionSheetController } from 'ionic-angular';
import { OdooToolsProvider } from '../../providers/odoo-tools/odoo-tools'
import { OdooScannerProvider } from '../../providers/odoo-scanner/odoo-scanner'
import { OdooConnectorProvider } from '../../providers/odoo-connector/odoo-connector';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import { OdooStockPickingProvider } from '../../providers/odoo-stock-picking/odoo-stock-picking';
import { PickingFormPage } from '../picking-form/picking-form';

@IonicPage()
@Component({
  selector: 'page-move-form',
  templateUrl: 'move-form.html',
})
export class MoveFormPage {

  move: {}
  conexion
  active_conexion
  cargar: Boolean 
  hide_scan_form: boolean
  move_id
  ScanReader: FormGroup;
  op_ready
  url_image

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let code 
    code = this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      console.log(val)
      this.scan_read(val)
    })
  
    }
  
  constructor(public actionSheetCtrl: ActionSheetController, public StockPicking: OdooStockPickingProvider, public odoo: OdooConnectorProvider, public navCtrl: NavController, private formBuilder: FormBuilder, public navParams: NavParams, public odootools: OdooToolsProvider, public scanner: OdooScannerProvider, public storage: Storage) {
  
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.cargar=true
    this.scanner.on()
    this.hide_scan_form = true
    this.move_id= this.navParams.data.move_id
    this.storage.get('odoo_conexion').then((val) => {
      if (val) {
        this.conexion = val
        this.odoo.get_conexion(val).then((conn)=>{
          if (conn){
            this.active_conexion = conn
            this.get_stock_move(this.move_id)
            
            this.get_op_ready()
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
  
    

  change_hide_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad MoveFormPage');
  }

  scan_read(val){
    this.odootools.presentToast('Picking form ' + val)    
  }

  get_op_ready(force=null){
    if (force != null){
      this.op_ready = force
    }
  }

  get_stock_move(id=false){
    if (!id){
      id = this.move_id
      }
    else {
      this.move_id = id
    }
    let model = 'stock.move.line'
    let values = {'line_id': id}
    //let picking_types = this.odoo.search_read(this.odoo, model, method, params)
    this.odoo.execute(model, 'get_stock_move_line_pda', values).then((res) =>{
      if (res) {
        this.move = res
        this.url_image = this.move['product_id']['image_medium']
        this.cargar=false
        //this.getItems(false)
        this.odootools.presentToast('Se han recuperado el movimiento ' + res['name']);
        }
      else{
        this.odootools.presentToast('Aviso!: No se ha recuperado ningún movimiento');
      }
      this.cargar=false
      })
      .catch(() => {
        this.cargar = false
        this.odootools.presentAlert('Aviso!', 'Error al recuperar los movimientos');
    });	
    //console.log(this.move['name'])
  }
  set_as_done(id=false, vals){
    return 
  }

  get_buttons_options(){
    let buttons = []
    buttons.push({
      text: this.move['picking_id'][1],
      role: 'cancel',
      cssClass: 'alert_state_back', 
      icon: 'backspace',
      handler: () => {
        this.navCtrl.setRoot(PickingFormPage, {'picking_id': this.move['picking_id'][0]});
      }
  })
  if (this.cargar || !this.move){
    return buttons
  }

    if (this.move['qty_done']>0 && !this.op_ready){
      buttons.push({
        text: 'Deshacer',
        role: 'destructive',
        cssClass: 'alert_state_error',
        icon: 'trash',
        handler: () => {
          this.set_as_done(this.move['id'], {'qty_done': 0.00, 'do_move_line': false});
        }
      })
    }
    if (this.op_ready){
      buttons.push({
        text: 'Confirmar',
        role: 'destructive',
        cssClass: 'alert_state_done',
        icon: 'checkmark-circle',
        handler: () => {
          this.set_as_done(this.move['id'], {'qty_done': this.move['product_qty'], 'do_move_line': true});
        }
      })
    }
    if (!this.op_ready){
      buttons.push({
        text: 'Marcar como completada',
        icon: 'checkmark',
        handler: () => {
          this.op_ready = true;
        }
      })
    } 
    if (this.op_ready){
      buttons.push({
        text: 'Marcar como pendiente',
        icon: 'close',

        handler: () => {
          this.op_ready = false;
        }
      })
    }
    if (!this.move['selected']['lot_id'] && this.move['product_id'][3]!= 'none'){
      buttons.push({
        text: 'Cambiar lote: ' + this.move['lot_id'] && this.move['lot_id'][1] + ' ',
        role: 'cambio_lote',
        cssClass: 'alert_state_back',
        icon: 'barcode',
        handler: () => {
          this.navCtrl.setRoot(PickingFormPage, {'picking_id': this.move['picking_id'][0]});
        }
      }) 
    }
    if (!this.move['selected']['package_id']){
      buttons.push({
        text: 'Cambiar paquete: ' + this.move['package_id'] && this.move['package_id'][1],
        role: 'cambio_paquete',
        cssClass: 'alert_state_back',
        icon: 'archive',
        handler: () => {
          this.navCtrl.setRoot(PickingFormPage, {'picking_id': this.move['picking_id'][0]});
        }
      }) 
    }
    if (!this.move['selected']['result_package_id']){
      buttons.push({
        text: 'Cambiar paquete destino: ' + this.move['result_package_id'] && this.move['result_package_id'][1],
        role: 'cambio_paquete',
        cssClass: 'alert_state_back',
        icon: 'archive',
        handler: () => {
          this.navCtrl.setRoot(PickingFormPage, {'picking_id': this.move['picking_id'][0]});
        }
      }) 
    }
    buttons.push({
      text: 'Cambiar paquete: ' + this.move['package_id'] && this.move['package_id'][1] + ' ',
      role: 'cambio_paquete',
      cssClass: 'alert_state_back',
      icon: 'barcode',
      handler: () => {
        this.navCtrl.setRoot(PickingFormPage, {'picking_id': this.move['picking_id'][0]});
      }
    })

    buttons.push({
      text: 'Cambiar cantidad: ' + this.move['qty_done'] + ' ' + this.move['product_uom_id'][1],
      role: 'cambio_cantidad',
      cssClass: 'alert_state_done',
      icon: 'cart',
      handler: () => {
        this.navCtrl.setRoot(PickingFormPage, {'picking_id': this.move['picking_id'][0]});
      }
  })

  
return buttons
  }
  presentOptions() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Opciones del movimiento ...',
      cssClass: 'action-sheets-move-page',
      buttons: this.get_buttons_options()
    });
 
    actionSheet.present();
  }
    
}
