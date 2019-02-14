import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { PickingListPage } from '../picking-list/picking-list';
import { MoveFormPage } from '../move-form/move-form'
import { MoveLineFormPage } from '../move-line-form/move-line-form'

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
  ScanReader: FormGroup
  valores: any
  todayDate: any
  dateToday: any
  picking_type: any
  arrow_movement: boolean
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.changeDetectorRef.detectChanges()
      switch(val) {
        case "left": {
          if(this.arrow_movement == true) {
            this.open_pick(-1)
            break
          }
        }

        case "right": {
          if(this.arrow_movement == true) {
            this.open_pick(1)
            break
          }
        }

        case "down": {
          if(this.arrow_movement == true) {
            this.backToPickingList()
            break
          }
        }

        case "up": {
          if(this.arrow_movement == true) {
            this.backToPickingList()
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

  constructor(private changeDetectorRef: ChangeDetectorRef, public navCtrl: NavController, public navParams: NavParams, private sound: SoundsProvider, public formBuilder: FormBuilder, private stockInfo: StockProvider, public scanner: ScannerProvider, public alertCtrl: AlertController) {
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.cargar=true
    this.scanner.on()
    this.move_model = 'stock.move'
    this.view_form = true
    this.index = Number(this.navParams.data.index)
    this.max_index = this.navParams.data.picking_ids.length
    this.get_picking_id(this.navParams.data.picking_ids[this.index]['id'])
    this.view_form = this.view_tree = true
    this.arrow_movement = true
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PickingFormPage');
  }
  
  check_scan(scan){
    return true
  }

  scan_read(val){
    //this.stockInfo.check_barcode_or_lot(val, this.stock_picking_id['id'])
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

  open_pick(index: number = 0) {
    this.sound.play('nav')
    this.index = this.index + Number(index)
    if (this.index >= this.max_index){this.index=0}
    if (this.index < 0 ){this.index=this.max_index-1}
    this.cargar=true
    let val = {'index': this.index, 'picking_ids': this.navParams.data.picking_ids}
    this.navCtrl.setRoot(PickingFormPage, val)
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
    console.log(id)
    var domain = [['id', '=', id]]
    this.stockInfo.get_stock_picking(domain, 'form').then((picks:Array<{}>)=> {  

      this.stockInfo.get_current_picking_type(picks[0]['picking_type_id'][0]).then((lines:Array<{}>) => {
        picks[0]['picking_type_id'].push(lines[0]['code'])
      })

      this.stock_picking_id = picks[0]
      this.changeDetectorRef.detectChanges()
     
      if (['done', 'assigned', 'partially_available'].indexOf(this.stock_picking_id['state'])!=-1){
        this.move_model = this.stock_picking_id['state'] == 'done' && 'stock.move' || 'stock.move.line'
        var domain_move = [['picking_id', '=', id]]
        this.stockInfo.get_stock_move(domain_move, 'tree', this.move_model).then((moves:Array<{}>)=> {
          
          this.stock_picking_id['moves'] = moves
          this.stock_picking_id['moves_lines_ids'] = this.stock_picking_id['moves']
          this.check_state()
          this.cargar=false
          this.changeDetectorRef.detectChanges()
        })
        .catch((mierror) => {
          this.stock_picking_id['moves'] = []
          this.stock_picking_id['moves_lines_ids'] = this.stock_picking_id['moves']
          this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los movimientos del albarán')
          this.cargar=false
          this.changeDetectorRef.detectChanges()
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

  open_form_move (model, id){
    let val = {'model': model, 'id': id, 'index': this.navParams.data.index, 'picking_ids': this.navParams.data.picking_ids}

    this.navCtrl.setRoot(MoveFormPage, val)
  }

  open_form_move_line (model, id, index){
    let val = {'model': model, 'id': id, 'index': this.navParams.data.index, 'picking_ids': this.navParams.data.picking_ids, 'index_lines': index, 'lines_ids': this.stock_picking_id['moves'], 'picking_type': this.stock_picking_id['picking_type_id'][2]}

    this.navCtrl.setRoot(MoveLineFormPage, val)
  }

  errorAlert(model, move_id, data) {
    let subtitulo = 'No se ha podido guardar en el id ' + move_id + ' del modelo ' + model + 'el valor: ' + data
    const alertError = this.alertCtrl.create({
      title: 'Error',
      subTitle: subtitulo,
      buttons: ['OK']
    });
    alertError.present();
  }

  validate_pick(stock_picking_id){
    let resultado = this.stockInfo.validate_picking(stock_picking_id)
    if (resultado['err'] == false) {
      this.stockInfo.presentAlert('Error de validación', 'No se ha podido validar el albarán, revisa sus datos.')
    } else {
      let alert = this.alertCtrl.create({
        title: 'Validación',
        message: 'El albarán ha sido validado.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.navCtrl.setRoot(PickingListPage)
            }
          }
        ]
      })
      alert.present()
    }
  }

  backToPickingList() {
    this.navCtrl.setRoot(PickingListPage)
  }

  toggle_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
    this.arrow_movement = !this.arrow_movement
    this.changeDetectorRef.detectChanges()
  }
}
