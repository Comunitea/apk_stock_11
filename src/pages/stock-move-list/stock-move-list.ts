import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { PickingFormPage } from '../picking-form/picking-form';
import { NewPickingFormPage } from '../new-picking-form/new-picking-form';
import { PickingListPage } from '../picking-list/picking-list';
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
  owner_id: any
  
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
          'code': 'assigned',
          'name': 'Reservado',
          'index': 0
        }
        this.get_owner_id()
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

  newPickingForm() {
    this.navCtrl.setRoot(NewPickingFormPage)
  }

  filterLocationsForPickings() {
    var current_locations_for_picking = []
    this.current_stock_moves.forEach(move => {
      var dupla = [move['location_id'][0], move['location_dest_id'][0]]
      var filtro = current_locations_for_picking.filter(element => element[0] === dupla[0] && element[1] === dupla[1])
      if(filtro.length == 0) {
        current_locations_for_picking.push(dupla)
      }
    });

    var pickingList = this.createPickings(current_locations_for_picking)
    this.open_picking_forms(pickingList)
  }

  createPickings(locations){
    var pickingList = []
    var moves_to_picking
    var picking_type_id
    this.stockInfo.get_picking_type_from_warehouse(this.default_warehouse).then((lineas:Array<{}>) => {
      if(lineas) {
        console.log(lineas)
        picking_type_id = lineas[0]['id']

        locations.forEach(location => {
          moves_to_picking = this.current_stock_moves.filter(x => x['location_id'][0] == location[0] && x['location_dest_id'][0] === location[1])
          var values = {
            'picking_type_id': picking_type_id,
            'move_type': 'direct',
            'location_id': location[0],
            'location_dest_id': location[1],
            'moves': moves_to_picking
          }
          this.stockInfo.create_new_picking_from_moves(values).then((result) => {
            result = {
              'id': result
            }
            this.move_lines_to_real_dest_location(result, location[1])
            pickingList.push(result)
          }).catch((error) => {
            console.log(error)
          })   
          return pickingList  
        }); 
      } else {
        return false
      }
    }).catch((mierror) => {
      this.full_stock_moves = []
      this.stockInfo.presentAlert('Error de conexión', 'No existe ningún tipo de operación de transferencia interna para este almacén.')
    })
  }

  open_picking_forms(pickingList) {    
    //this.navCtrl.setRoot(PickingListPage)
    this.sound.play('nav')
    let val = {'index': 0, 'picking_ids': pickingList}
    this.navCtrl.setRoot(PickingFormPage, val)
  }

  move_lines_to_real_dest_location(picking_id, location_id) {
    var domain = [['picking_id', '=', picking_id['id']]]
    this.stockInfo.get_stock_move_lines_simple(domain, 'tree', 'stock.move.line').then((lines:Array<{}>) => {
      console.log(lines)
      lines.forEach(line => {
        this.stockInfo.new_location_dest(location_id, undefined, line['id']).then((done) => {
          console.log(done)
        }).catch((error) => {
          console.log(error)
        })
      })
    })
    .catch((error) => {
      console.log(error)
    })
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

  get_owner_id(){
    this.storage.get('USER').then((val) => {
      this.owner_id = val
      this.get_selected_warehouse()
    })
  }

  get_move_domain(){
    var domain = []
    if (this.move_state_filter != 0 && this.move_state_filter != undefined){
      domain = [['state', '=', this.move_state_filter], ['create_uid', '=', this.owner_id[0]['id']]]
    } else {
      domain = [['state', 'in', ['assigned']], ['create_uid', '=', this.owner_id[0]['id']]]
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


