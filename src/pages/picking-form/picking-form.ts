import { Component, ChangeDetectorRef } from '@angular/core';
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
import { PickingPage } from '../picking/picking';
import { Storage } from '@ionic/storage';
import { OdooStockPickingProvider } from '../../providers/odoo-stock-picking/odoo-stock-picking';
import { SpeechRecognition } from '@ionic-native/speech-recognition';

import { ActionSheetController } from 'ionic-angular';

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
  voice: boolean 
  matches: String[];
  isRecording = false;  
  escuchando:boolean

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let code 
    code = this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      console.log(val)
      this.scan_read(val)
    })
  
    }

  constructor( public actionSheetCtrl: ActionSheetController, private cd:ChangeDetectorRef, public sp: SpeechRecognition, public StockPicking: OdooStockPickingProvider, public odoo: OdooConnectorProvider, public navCtrl: NavController, private formBuilder: FormBuilder, public navParams: NavParams, public odootools: OdooToolsProvider, public scanner: OdooScannerProvider, public storage: Storage) {
    
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.scanner.on()
    this.header = true
    this.escuchando= false
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
    this.sp.isRecognitionAvailable().then((available: boolean) => {
        this.voice=available;
      }).catch((reason) => {this.voice= false})
    this.cargar=true
  }
  save_moves(moves){
    this.storage.set('moves', moves)
  }
  change_escuchando(){
    this.escuchando=!this.escuchando
    if (this.escuchando){
      this.startListening()
    }
  }
  
  recon_voice(matches){
    this.odootools.presentToast("Escucho ..." + matches)
    this.matches = matches;
    this.cd.detectChanges();
    if (matches.indexOf('atras')){
      this.save_moves({})
      this.navCtrl.setRoot(PickingPage)
    }
    else if (this.matches.indexOf('lote')){
      
    }
    else if (this.matches.indexOf('paquete')){
      
    }
    else if (this.matches.indexOf('origen')){
      
    }
    else if (this.matches.indexOf('cantidad')){
      //validar albarán
    }
    else if (this.matches.indexOf('destino')){
      
    }
    else if (this.matches.indexOf('validar')){
      //leer albarán
    }
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
  ionViewDidLoad() {
    console.log('ionViewDidLoad PickingFormPage');
  }

  change_hide_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
  }

  change_header() {
    this.odootools.play('beep')
    this.header = !this.header
  }
 
  scan_read(val){
    this.odootools.play('beep')
    //this.odootools.presentToast('Picking form ' + val)    
  }

  submitScan(){
    this.odootools.play('beep')
    this.startListening()
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
    this.save_moves(this.moves)
    this.cargar = false

  }
  onchange_filter_moves(){
    this.picking['filter'] = this.filter_moves
    this.moves = this.get_moves_to_show(this.picking['moves'])
  }
  get_moves_to_show(moves){
    
    if (this.filter_moves =="T"){
      return moves
    }
    else if (this.filter_moves=='P'){
      return moves.filter(move => !move.pda_done)
      }
    else if (this.filter_moves=='R'){
      return moves.filter(move => move.pda_done)
    }
    this.save_moves(moves)
    return moves

  }
  open_lines(filter='T'){
    this.filter_moves = filter
    this.odootools.play('beep')
    this.header = false
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
        this.picking['filter'] = this.filter_moves
        this.moves = this.get_moves_to_show(this.picking['moves'])
        this.cargar=false
        //this.getItems(false)
        //this.odootools.presentToast('Se han recuperado los movimeintos ' + res);
        }
      else{
        this.odootools.play('error')
        this.odootools.presentToast('Aviso!: No se ha recuperado ningún albarán');
      }
      this.cargar=false
      })
      .catch(() => {
        this.cargar = false
        this.odootools.play('fatal_error')
        this.odootools.presentAlert('Aviso!', 'Error al recuperar los tipos de albarán');
    });	
    console.log(this.picking)
  }

  presentOptions(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Opciones del movimiento ...',
      cssClass: 'action-sheets-move-page',
      buttons: this.get_buttons_options()
    });
 
    actionSheet.present();
  }
  get_buttons_options(){
    let buttons = []
    buttons.push({
      text: 'Albaranes',
      role: 'cancel',
      cssClass: 'alert_state_back', 
      icon: 'backspace',
      handler: () => {
        this.navCtrl.setRoot(PickingPage);
      }
  })
  if (this.cargar || !this.picking){
    return buttons
  }
  let icon = this.voice && this.escuchando && 'mic' || 'mic-off'
  let text= this.voice && this.escuchando && 'Escuchar' || 'No escuchar'
  buttons.push({
      text: text,
      role: 'destructive',
      cssClass: 'alert_state_done',
      icon: icon,
      handler: () => {
        this.change_escuchando()}});

  icon = this.header && 'clipboard' || 'list'
  text= this.header && 'Cabecera' || 'Detalles'
  buttons.push({
      text: text,
      role: 'destructive',
      cssClass: 'alert_state_done',
      icon: icon,
      handler: () => {
        this.change_header()}});
  icon = 'barcode'
  text= 'Barcode'
  buttons.push({
      text: text,
      role: 'destructive',
      cssClass: 'alert_state_done',
      icon: icon,
      handler: () => {
        this.change_hide_scan_form()}});
   
    
 

  
  return buttons
  }
}
