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
import { StockInventoryPage } from '../stock-inventory/stock-inventory';
import { StockInventoryFormLinePage } from '../stock-inventory-form-line/stock-inventory-form-line';
import { StockInventoryFormNewLinePage } from '../stock-inventory-form-new-line/stock-inventory-form-new-line';

/**
 * Generated class for the StockInventoryFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'stock-inventory-form',
  templateUrl: 'stock-inventory-form.html',
})
export class StockInventoryFormPage {
  @ViewChild('scan') myScan ;

  cargar: boolean
  inventory_movement_id: any
  index: number
  hide_scan_form: boolean
  max_index: number
  ScanReader: FormGroup
  valores: any
  todayDate: any
  dateToday: any
  arrow_movement: any
  type: string
  lines_index: any
  move_stock: any
  new_package: any
  already_package: any
  new_package_done: any
  new_package_name: any

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.changeDetectorRef.detectChanges()
      switch(val) {
        case "left": {
          if(this.arrow_movement == true && this.type == 'list') {
            this.open_pick(-1)
            break
          }
        }

        case "right": {
          if(this.arrow_movement == true && this.type == 'list') {
            this.open_pick(1)
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
    this.index = Number(this.navParams.data.index)
    this.max_index = this.navParams.data.inventory_ids.length
    this.type = this.navParams.data.type
    this.inventory_movement_id = []
    this.lines_index = []
    this.arrow_movement = true
    this.move_stock = []
    this.new_package = false
    this.already_package = false
    this.new_package_done = false
    this.new_package_name = false
    if(this.type == 'list') {
      this.get_inventory_movement_id(this.navParams.data.inventory_ids[this.index]['id'])     
    } else {
      this.get_inventory_movement_id(this.navParams.data.index)
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StockInventoryFormPage');
  }
  
  check_scan(scan){
    return true
  }

  scan_read(val){
    //this.stockInfo.check_barcode_or_lot(val, this.inventory_movement_id['id'])
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
    this.sound.play('nav')
    this.index = this.index + Number(index)
    if (this.index >= this.max_index){this.index=0}
    if (this.index < 0 ){this.index=this.max_index-1}
    this.cargar=true
    this.get_inventory_movement_id(this.navParams.data.inventory_ids[this.index]['id'])
  }

  get_inventory_movement_id(id){

    this.stockInfo.get_inventory_movement_info(id).then((lines:Array<{}>)=> {        

      this.set_move_data(lines[0])
      this.changeDetectorRef.detectChanges()

    })
    .catch((mierror) => {
      console.log(mierror)
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar el pick')
      this.cargar=false
    })

    return
  }

  set_move_data(move_data) {
    this.inventory_movement_id = move_data
    this.inventory_movement_id['lines_data'] = []
    this.check_inventory_movement_state()
    this.changeDetectorRef.detectChanges()

    this.get_movement_lines_info()
    this.changeDetectorRef.detectChanges()

    if(this.inventory_movement_id['state'] == 'done') {
      this.get_inventory_stock_move_info(this.inventory_movement_id['move_ids'])
      this.changeDetectorRef.detectChanges()
    }

    console.log(this.inventory_movement_id)
  }

  check_inventory_movement_state() {
    switch (this.inventory_movement_id['filter']) {
      case 'none': {
        this.inventory_movement_id['filter_expl'] = 'Todos los productos'
        break
      }

      case 'category': {
        this.inventory_movement_id['filter_expl'] = 'Una categoría de producto'
        break
      }

      case 'product': {
        this.inventory_movement_id['filter_expl'] = 'Sólo un producto'
        break
      }

      case 'partial': {
        this.inventory_movement_id['filter_expl'] = 'Productos seleccionados manualmente'
        break
      }

      case 'lot': {
        this.inventory_movement_id['filter_expl'] = 'Un lote/número de serie'
        break
      }

      case 'pack': {
        this.inventory_movement_id['filter_expl'] = 'Un paquete'
        break
      }
    }
  }

  get_movement_lines_info() {
    this.stockInfo.get_inventory_line_info(this.inventory_movement_id['line_ids'], 'tree').then((lines:Array<{}>) => {
      let k = 0
      this.inventory_movement_id['lines_data'] = lines
      this.changeDetectorRef.detectChanges()
      lines.forEach(line => {
        if(this.already_package == false && line['package_id'] !=  false) {
          this.already_package = true
        }
        this.lines_index[k] = {
          'id': line['id']
        }
        k++
      });
     })
     .catch((mierror) => {
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar las líneas.')
      this.cargar=false
    })
  }

  get_inventory_stock_move_info(domain) {
    this.stockInfo.get_inventory_stock_move(domain, 'inview').then((lines:Array<{}>) => {
      this.move_stock = lines
    })
    .catch((mierror) => {
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar las líneas.')
      this.cargar=false
    })
  }

  inventory_action_start(id) {
    this.stockInfo.inventory_action_execute(id, 'action_start_apk').then((lines:Array<{}>) => {
      if(lines) {
        this.move_to_inventory(id)
      }
    })
    .catch((mierror) => {
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar las líneas.')
      this.cargar=false
    })
  }

  inventory_validate(id) {
    this.check_if_new_pkg()
    this.stockInfo.inventory_action_execute(id, 'action_done_apk').then((lines:Array<{}>) => {
      if(lines) {
        this.move_to_inventory(id)
      }
    })
    .catch((mierror) => {
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar las líneas.')
      this.cargar=false
    })
  }

  inventory_action_cancel_draft(id) {
    this.stockInfo.inventory_action_execute(id, 'action_cancel_draft_apk').then((lines:Array<{}>) => {
      if(lines) {
        this.backToInventoryPage()
      }
    })
    .catch((mierror) => {
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar las líneas.')
      this.cargar=false
    })
  }

  save_new_package(value) {
    this.new_package = value
    this.changeDetectorRef.detectChanges()
  }

  check_if_new_pkg() {
    if(this.new_package) {
      var name = 'PQT[' + this.inventory_movement_id['name'] + ']'
      this.new_package_name = name
      this.changeDetectorRef.detectChanges()
      this.stockInfo.create_new_package('stock.quant.package', name).then((lineas:Array<{}>) => {
        this.update_lines_data(lineas)
      })
    } 
  }

  update_lines_data(package_id) {
    this.stockInfo.get_lines_quants(this.inventory_movement_id['line_ids'], package_id).then((lines:Array<{}>) => {
      this.new_package_done = lines
    })
  }

  new_inventory_line(id) {
    this.sound.play('nav')
    let val = {'inventory_id': id, 'warehouse_id': this.inventory_movement_id['location_id'][0]}
    this.navCtrl.setRoot(StockInventoryFormNewLinePage, val)  
  }

  move_to_inventory(id) {
    this.sound.play('nav')
    let val = {'index': id, 'inventory_ids': '', 'type': 'new'}
    this.navCtrl.setRoot(StockInventoryFormPage, val)    
  }

  open_inventory_line(index_list, index){
    this.sound.play('nav')
    let val = {'index': index, 'inventory_ids': index_list}
    this.navCtrl.setRoot(StockInventoryFormLinePage, val) 
  }


  backToInventoryPage() {
    /* Volvemos al listado inicial. */
    this.navCtrl.setRoot(StockInventoryPage)
    this.changeDetectorRef.detectChanges()
  }

}
