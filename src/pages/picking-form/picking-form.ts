import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { PickingListPage } from '../picking-list/picking-list';

/**
 * Generated class for the PickingFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-picking-form',
  templateUrl: 'picking-form.html',
})
export class PickingFormPage {
  @ViewChild('scan') myScan ;

  cargar: boolean
  stock_picking_id: {} 
  view_form: boolean
  view_tree: boolean
  index: number
  hide_scan_form: boolean
  max_index: number
  move_model: string
  ScanReader: FormGroup;
  

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let code 
    code = this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      //console.log(val)
      this.scan_read(val)
    })
  
    }
  constructor(public navCtrl: NavController, public navParams: NavParams, private sound: SoundsProvider, public formBuilder: FormBuilder, private stockInfo: StockProvider, public scanner: ScannerProvider) {
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.cargar=true
    this.scanner.on()
    this.move_model = 'stock.move'
    this.view_form = true
    this.index = Number(this.navParams.data.index)
    this.max_index = this.navParams.data.picking_ids.length
    this.get_picking_id(this.navParams.data.picking_ids[this.index]['id'])
    this.view_form = this.view_tree = true
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PickingFormPage');
  }
  
  check_scan(scan){
    return true
  }

  scan_read(val){
    //this.odootools.presentToast('Picking form ' + val)
  }
  
  submitScan(scan=false){
    if (!scan){
      scan = this.ScanReader.value['scan']
    }
    
    
    //SI NO RECIBO NADA, ESCUCHO
    if (!scan){
      this.sound.startListening()
    }
    
    //SI RECIBO ALGO MIRO A VER SI ES ALGO DEL MOVIMIENTO
    if (!this.check_scan(scan)){
      this.sound.recon_voice(scan)
    }
 
    this.myScan.setFocus()
  }

  open_pick(index: number = 0){
    this.index = this.index + Number(index)
    if (this.index >= this.max_index){this.index=0}
    if (this.index < 0 ){this.index=this.max_index-1}
    this.cargar=true
    this.get_picking_id(this.navParams.data.picking_ids[this.index]['id'])
    this.sound.play('nav')
  }
  check_state(){
    if (this.stock_picking_id['state'] == 'done'){
      // 'stock.move
      this.stock_picking_id['move_count'] = this.stock_picking_id['moves'].length
      this.stock_picking_id['move_done_count'] =  this.stock_picking_id['move_count'] 
      }
    else {
      // 'stock.move.line
      var move_done = this.stock_picking_id['moves'].filter(x=> x['qty_done'] > 0.00)
      this.stock_picking_id['move_count'] = this.stock_picking_id['moves'].length
      this.stock_picking_id['move_done_count'] = move_done.length
      }

  }
  get_picking_id(id){
    var domain = [['id', '=', id]]
    console.log(domain)
    this.stockInfo.get_stock_picking(domain, 'form').then((picks:Array<{}>)=> {
      this.stock_picking_id = picks[0]
      
      if (['done', 'assigned', 'partially_available'].indexOf(this.stock_picking_id['state'])!=-1){
        this.move_model = this.stock_picking_id['state'] == 'done' && 'stock.move' || 'stock.move.line'
        var domain_move = [['picking_id', '=', id]]
        this.stockInfo.get_stock_move(domain_move, 'tree', this.move_model).then((moves:Array<{}>)=> {
          
          this.stock_picking_id['moves'] = moves
          this.check_state()
          this.cargar=false
        })
        .catch((mierror) => {
          this.stock_picking_id['moves'] = []
          this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los movimientos del albarán')
          this.cargar=false
        })
      }
    })
    .catch((mierror) => {
      this.stock_picking_id = []
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar el pick')
      this.cargar=false
    })
    return
  }
  open_form (model, id){

  }

}
