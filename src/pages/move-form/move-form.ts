import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { leave } from '@angular/core/src/profile/wtf_impl';
import { PickingPage } from '../picking/picking';
import { NON_TEXT_INPUT_REGEX } from 'ionic-angular/umd/util/dom';

@IonicPage()
@Component({
  selector: 'page-move-form',
  templateUrl: 'move-form.html',
})
export class MoveFormPage {
  @ViewChild('scan') myScan ;

  
  conexion
  active_conexion
  cargar: Boolean 
  hide_scan_form: boolean
  move_id
  ScanReader: FormGroup;
  op_ready
  url_image
  options: boolean = false;
  voice: boolean 
  matches: String[];
  isRecording = false;  
  escuchando:boolean
  last_scan: {'type': string, 'value': string}  
  model: string
  new_lot
  move:{}
  move_min : {}
  moves: []
  picking: {}
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let code 
    code = this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      //console.log(val)
      this.scan_read(val)
    })
  
    }
  
  constructor(private cd:ChangeDetectorRef, public sp: SpeechRecognition, public actionSheetCtrl: ActionSheetController, public StockPicking: OdooStockPickingProvider, public odoo: OdooConnectorProvider, public navCtrl: NavController, private formBuilder: FormBuilder, public navParams: NavParams, public odootools: OdooToolsProvider, public scanner: OdooScannerProvider, public storage: Storage) {
  
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.cargar=true
    this.scanner.on()
    this.hide_scan_form = true
    this.move_id= this.navParams.data.move_id
    this.picking = this.navParams.data.picking
    this.model =  this.navParams.data.object || 'stock.move.line'

    this.odootools.presentToast(this.model)
    this.last_scan = {'type': 'package_id', 'value': ' '}
    this.new_lot = []
    this.storage.get('moves').then((val)=>{
      if (val)
        {this.moves=val}
      else
        {this.moves=[]}

    })
    this.storage.get('odoo_conexion').then((val) => {
      if (val) {
        this.conexion = val
        this.odoo.get_conexion(val).then((conn)=>{
          if (conn){
            this.active_conexion = conn
            this.get_stock_move(this.move_id)
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
    this.sp.isRecognitionAvailable().then((available: boolean) => {
      this.voice=available;
    }).catch((reason) => {this.voice= false})
    //this.VoiceRec.isRecognitionAvailable().then((available: boolean) => {this.voice=available; this.odootools.presentToast('Voice control:  ' + available)})
  }

  save_moves(moves){
    this.storage.set('moves', moves)
  }

  change_escuchando(){
    this.escuchando = !this.escuchando
    if (this.escuchando){
      this.startListening()
    }
  }
  
  recon_voice(matches){
    this.matches = matches
    this.odootools.presentToast("Escucho ..." + matches)
    this.cd.detectChanges();
    for (let m in matches){
      if (this.recon_voice1(matches[m]))
      {return}
    }
  }
  recon_voice1(match) {
  
    if (match.indexOf('atras')!=-1){
      
      this.cargar_picking(this.move['picking_id']['id']);
    }
    else if (match.indexOf('lote')!=-1){
      
    }
    else if (match.indexOf('paquete')!=-1){
      
    }
    else if (match.indexOf('origen')!=-1){
      
    }
    else if (match.indexOf('cantidad')!=-1){
      //validar albarán
    }
    else if (match.indexOf('destino')!=-1){
      
    }
    else if (match.indexOf('validar')!=-1){
      //leer albarán

    } 
    else if (this.recon_repite(match)){
       return true
    }
  return false
}

recon_repite(match){
    let repite = 'repite'
    
      if (match.indexOf(repite) !== -1){
        
        let to_read = match.replace(repite, '').replace(' ', '')
        if (to_read=='todo'){
          this.odootools.lee(this.odootools.str_form('move', this.move))
          return true
        }
        else if (to_read=='cantidad'){
          this.odootools.lee("Cantidad: " + this.move['product_uom_qty']['product_uom_qty'])
          return true
        }
        else if (this.move[to_read + '_id']){
          this.odootools.lee(this.odootools.str_form(to_read, this.move[to_read + '_id']))
          return true
        }

      }
  
  return false
}

startListening() {
  if (!this.voice){return}
  this.odootools.presentToast("Escuchando ...")
  let options = {
    language: 'es-ES',
    matches: 3,
    showPopup: false,
    showPartial: true
  }
  this.sp.startListening(options).subscribe(matches => {
    this.recon_voice(matches)
  });
  this.isRecording = true;
}

  change_hide_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad MoveFormPage');
  }

  scan_read(val){
    //this.odootools.presentToast('Picking form ' + val)
  }

  get_op_ready(force=null){
    if (force != null){
      this.op_ready = force
    }
    let c = this.move['checked']
    if (!c){this.op_ready = false}
    this.op_ready = this.move['checked']['product_id'] && this.move['checked']['package_id'] && this.move['checked']['lot_id'] && this.move['checked']['location_id'] 
    //&& this.move['checked']['location_dest_id'] && this.move['checked']['result_package_id'] && this.move['checked']['qty']
  }

  get_stock_move(id=false){
    if (!id){
      id = this.move_id
      }
    else {
      this.move_id = id
    }
    
    
    let values = {'line_id': id}
    //let picking_types = this.odoo.search_read(this.odoo, model, method, params)
    this.odoo.execute(this.model, 'get_stock_move_line_pda', values).then((res) =>{
      if (res) {
        this.move = res
        this.url_image = this.move['product_id']['image']
        this.cargar=false
        //this.getItems(false)
        this.odootools.play('beep')
        this.get_op_ready()
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
  set_as_done2(id=0, vals){
    this.set_as_done(id, vals)
    return 
  }
  set_as_done(move_id=0, vals={}){
    let values = {'move_id': move_id, 'vals': vals}
    let model = 'stock.move.line'
    let method='set_as_pda_done'
    let res = {}
    return this.set_as_done_execute(model, method, values, move_id)
  }
  
  confirm_lots(){
    let values = {'move_id': this.move['id'], 'lot_ids': this.new_lot}
    let method='create_moves_from_serial'
    let model = this.move['object']
    return this.set_as_done_execute(model, method, values, this.move['id'])
  }

  set_as_done_execute(model, method, values, move_id){
    this.odoo.execute(model, method, values).then((res) =>{
      if(res['err']){
        this.odootools.presentToast("Error al acceder a odoo:" + res['error'])
        
        }
      else{
        let next_move = this.odootools.get_next_move(move_id, this.moves, this.picking)
        this.moves.filter(x => x['object']=='model' && x['id'] == move_id)['pda_done']=true
        this.save_moves(this.moves)
        
        if (next_move){
          this.cargar = true
          this.get_stock_move(next_move['id'])
        }
        else {
          this.cargar = true
          this.cargar_picking(this.move['picking_id']['id']);
        }


      }   
      return res      
    })

  }

 

  get_lot_selection(move_id){
    let values = {'move_id': move_id}
    let model = 'stock.production.lot'
    let method='get_alternative_lots'
    this.odoo.execute(model, method, values).then((res) =>{
      if(res['err']){this.odootools.presentToast("Error al acceder a odoo:" + res['error'])}
      else {
        if (!res['lots']){this.odootools.presentAlert("AVISO !!!", "No hay más lotes disponibles")}
        else {
          let actionSheet = this.actionSheetCtrl.create({
            title: 'Opciones de lote ...',
            cssClass: 'action-sheets-move-page',
            buttons: this.get_buttons_lot_seleccion(res['lots'])
          });       
          actionSheet.present();
        }
      }   
    })

  }
  get_buttons_lot_seleccion (available_lots){
    
    let buttons = []
    buttons.push({
      text: this.move['lot_id']['name'],
      role: 'cancel',
      cssClass: 'alert_state', 
      icon: 'backspace',
      handler: () => {
        
      }
    })
    let bt
    for (let btn in available_lots){
        bt = available_lots[btn]
        buttons.push({
        text: this.odootools.get_lot_str(bt, 'min'),
        role: 'destructive',
        cssClass: 'alert_state', 
        icon: 'barcode',
        handler: () => {
          this.odootools.presentAlert("Cambio Lote", "Cambiando a lote " + bt['lot_id']['name'])
          //this.change_lot(this.move['move_id'], bt[1]);
        }
      })
    }
    return buttons
  }
  get_buttons_options(){
    let buttons = []
    buttons.push({
      text: this.move['picking_id']['name'],
      role: 'cancel',
      cssClass: 'alert_state', 
      icon: 'backspace',
      handler: () => {
        this.cargar_picking(this.move['picking_id']['id']);
      }
  })
  if (this.cargar || !this.move){
    return buttons
  }


  if (this.move['pda_done']){
    buttons.push({
      text: 'Marcar como pendiente',
      role: 'destructive',
      cssClass: 'alert_state_error',
      icon: 'trash',
      handler: () => {
        this.set_as_done(this.move['id'], {'qty_done': 0.00, 'pda_done': false});
      }
    })
  }
  if (!this.move['pda_done'] && !this.op_ready){
    buttons.push({
      text: 'Marcar como completada',
      role: 'destructive',
      cssClass: 'alert_state_done',
      icon: 'checkmark-circle',
      handler: () => {
        this.set_as_done(this.move['id'], {'qty_done': this.move['qty_done'], 'pda_done': true});
      }
    })
  } 
  
  if (!this.move['pda_done'] && this.move['lot_id'] && !this.move['checked']['lot_id'] && this.move['product_id']['tracking']!= 'none'){
    buttons.push({
      text: 'Cambiar lote: ' + this.move['lot_id']['name']  , //+ this.move['lot_id'] && this.move['lot_id']['name'] + ' ',
      role: 'cambio_lote',
      cssClass: 'alert_state',
      icon: 'barcode',
      handler: () => {
        this.get_lot_selection(this.move['id']);
      }
    }) 
  }

  if (!this.move['pda_done'] && this.move['package_id'] && !this.move['checked']['package_id']){
    buttons.push({
      text: 'Cambiar paquete: '+ this.move['package_id']['name'] ,//+ this.move['package_id'] && this.move['package_id']['name'],
      role: 'cambio_paquete',
      cssClass: 'alert_state',
      icon: 'archive',
      handler: () => {
        this.get_lot_selection(this.move['id']);
      }
    }) 
  
 /* 
  if (!this.move['pda_done'] && !this.move['checked']['result_package_id'] && false){
    buttons.push({
      text: 'Cambiar paquete destino: ' ,//+ this.move['result_package_id'] && this.move['result_package_id']['name'],
      role: 'cambio_paquete',
      cssClass: 'alert_state',
      icon: 'archive',
      handler: () => {
        this.cargar_picking(this.move['picking_id']['id']);
      }
    }) 
  }
 
  if (!(this.move['checked']['result_package_id'] || this.move['checked']['location_dest_id'] || this.move['pda_done']) && false){
    buttons.push({
      text: 'Cambiar cantidad: ' ,//+ this.move['qty_done'] + ' ' + this.move['product_uom_id']['name'],
      role: 'cambio_cantidad',
      cssClass: 'alert_state',
      icon: 'cart',
      handler: () => {
        this.cargar_picking(this.move['picking_id']['id']);
      }
    }) */
  }

  
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
  
  click(value){
    let c = this.move['checked']
    if (value=='product_id'){
      c.product_id = !c.product_id
    }
    else if (value=='package_id'){
      c.package_id = !c.package_id
      c.product_id= c.package_id
      c.location_id= c.package_id
      c.lot_id = c.package_id
    }
    else if (value=='lot_id'){
      c.lot_id = !c.lot_id
      c.product_id= c.lot_id
    }
    else if (value=='location_id'){
      c.location_id= !c.location_id
    }
    else if (value=='location_dest_id'){
      c.location_dest_id= !c.location_dest_id
    }
    else if (value=='result_package_id'){
      c.result_package_id = !c.result_package_id
      c.location_dest_id=  c.result_package_id
    }
    else if (value=='product_qty'){
      c.package_qty = !c.package_qty
    }
    this.get_op_ready()
  }

  double_scan(scan){
    if (this.move[this.last_scan.type] && (this.move[this.last_scan.type]['name'] == scan || this.move[this.last_scan.type]['barcode'] == scan)){
      if (this.op_ready){
        this.last_scan.type=''
        return this.set_as_done(this.move['id'], {'qty_done': this.move['qty_done'], 'pda_done': true});
      }
    }
  }
  agregar(type){
    if (type=='serial'){
      this.last_scan.type='serial'
    } else if (type=='lot'){
      this.last_scan.type='lot'
    }
  }
  check_scan(scan){
    if (["serial", "lot"].indexOf(this.last_scan.type)!=-1){
      if (this.model=='stock.move'){
        this.new_lot.push({'name': scan, 'qty': 1.00})
      }
      else{
          this.new_lot = [{'name': scan, 'qty': 1.00}]      
        }
      this.myScan.value=''
      this.ScanReader.value['scan'] = ''
      return true
    }

    this.odootools.presentToast(this.last_scan.type + this.last_scan.value)

    if (this.last_scan.type && this.last_scan.value == scan){
      this.last_scan.value=''
      this.double_scan(scan)
      return true
    }
    let fields = ['package_id', 'lot_id', 'product_id', 'location_id', 'location_dest_id', 'result_package_id']
    let name= ''
    for (let n in fields){
      name = fields[n]
      if (this.move[name] && this.move[name]['name']==scan){
        //
        this.click(name)
        this.last_scan.type = name
        this.last_scan.value = scan
        return true

      }
    }
    return false
  }
  submitScan(scan=false){
    if (!scan){
      scan = this.ScanReader.value['scan']
    }
    
    
    //SI NO RECIBO NADA, ESCUCHO
    if (!scan){
      this.startListening()
    }
    
    //SI RECIBO ALGO MIRO A VER SI ES ALGO DEL MOVIMIENTO
    if (!this.check_scan(scan)){
    this.recon_voice(scan)}
    
  this.myScan.setFocus()
  }

  cargar_picking(picking_id=false){
    if (picking_id){
      this.navCtrl.setRoot(PickingFormPage, {'picking_id': this.move['picking_id']['id']})
    }
    else this.navCtrl.setRoot(PickingPage)
  }



  
}
