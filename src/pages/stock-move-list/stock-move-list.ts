import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { PickingFormPage } from '../picking-form/picking-form';
import { StockMoveFormPage } from '../stock-move-form/stock-move-form'


/**
 * Generated class for the StockMoveListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'stock-move-list',
  templateUrl: 'stock-move-list.html',
})
export class StockMoveListPage {
  
  full_stock_moves: any
  ScanReader: FormGroup;
  default_warehouse: any
  move_state_filter: any
  move_status: any
  current_stock_moves: any
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let code 
    code = this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.scan_read(val)
    })
  
    }

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private storage: Storage, private sound: SoundsProvider, 
        private stockInfo: StockProvider, private formBuilder: FormBuilder, private scanner: ScannerProvider) {
        this.move_state_filter = 0
        this.move_status = []
        this.move_status[0] = {
          'id': 0,
          'code': 'waiting',
          'name': 'En espera',
          'index': 0
        }
        this.move_status[1] = {
          'id': 1,
          'code': 'confirmed',
          'name': 'Confirmado',
          'index': 1
        }
        this.move_status[2] = {
          'id': 2,
          'code': 'partially_available',
          'name': 'Parcial',
          'index': 2
        }
        this.move_status[3] = {
          'id': 3,
          'code': 'assigned',
          'name': 'Reservado',
          'index': 3
        }
        this.get_selected_warehouse()
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad StockMoveListPage');
  }
 
  change_hide_scan_form() {
    this.scanner.hide_scan_form = !this.scanner.hide_scan_form
  }

  scan_read(val){
    
  }

  newStockMovement() {
    this.navCtrl.setRoot(StockMoveFormPage)
  }
  
  open_pick(inventory_id: number = 0){
    this.sound.play('nav')
    let val = {'id': inventory_id, 'moves_ids': this.current_stock_moves, 'type': 'list'}
    this.navCtrl.setRoot(StockMoveFormPage, val)    
  }
 
  submitScan(value=false){
    let scan
    if (!this.ScanReader.value['scan']){
      this.sound.startListening()
    }
    scan = value && this.ScanReader.value['scan']
    this.sound.recon_voice([this.ScanReader.value['scan']])  
    
  }

  get_selected_warehouse(){
    this.storage.get('selected_warehouse').then((val) => {
      this.default_warehouse = val
      this.get_stock_move_list()
    })
  }

  get_move_domain(){
    var domain = []
    if (this.move_state_filter != 0 && this.move_state_filter != undefined){
      domain = [['state', '=', this.move_state_filter]]
    } else {
      domain = [['state', 'in', ['waiting', 'confirmed', 'partially_available', 'assigned']]]
    }
   return domain
  }

  get_stock_move_list(){
    // Filtrar por estado o lo que haga falta.
    var domain = this.get_move_domain()
    domain.push(['company_id', '=', this.default_warehouse])
    domain.push(['picking_id', '=', null])
    domain.push(['inventory_id', '=', null])

    this.stockInfo.get_stock_move_list(domain, 'tree').then((lines:Array<{}>) => {
      console.log(lines)
      this.full_stock_moves = []
      for (var line in lines){
        lines[line]['index']=line
        this.full_stock_moves.push(lines[line])
        this.move_filter('type', this.move_state_filter)
      }
    }).catch((mierror) => {
      this.full_stock_moves = []
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros')
    })
  }

  move_filter(move_state, value) {
    this.move_state_filter = value
    if (move_state=='type'){
      if (value !=0){
        this.current_stock_moves = this.full_stock_moves.filter(x => x['state']==value)
      }
      else {
        this.current_stock_moves = this.full_stock_moves
      }
    }
    for (var i in this.current_stock_moves){
      this.current_stock_moves[i]['index'] = i
    }
  }
}


