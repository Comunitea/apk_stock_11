import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { StockInventoryFormPage } from '../stock-inventory-form/stock-inventory-form';
import { StockInventoryCreatePage } from '../stock-inventory-create/stock-inventory-create';


/**
 * Generated class for the StockInventoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'stock-inventory',
  templateUrl: 'stock-inventory.html',
})
export class StockInventoryPage {
  pet: string = "puppies";
  current_inventory_list: any
  full_inventory_list: any
  inventory_type_filter: any
  inventory_types: any
  ScanReader: FormGroup;
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let code 
    code = this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      console.log(val)
      this.scan_read(val)
    })
  
    }

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private storage: Storage, private sound: SoundsProvider, 
        private stockInfo: StockProvider, private formBuilder: FormBuilder, private scanner: ScannerProvider) {
        this.inventory_type_filter = 0
        this.inventory_types = []
        this.inventory_types[0] = {
          'id': 1,
          'code': 'draft',
          'name': 'Borrador',
          'index': 0
        }
        this.inventory_types[1] = {
          'id': 2,
          'code': 'confirm',
          'name': 'En proceso',
          'index': 1
        }
        this.init_inventory_list();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StockInventoryPage');
  }
 
  change_hide_scan_form() {
    this.scanner.hide_scan_form = !this.scanner.hide_scan_form
  }

  scan_read(val){
    
  }
  
  open_pick(inventory_id: number = 0){
    this.sound.play('nav')
    let val = {'index': inventory_id, 'inventory_ids': this.current_inventory_list, 'type': 'list'}
    this.navCtrl.setRoot(StockInventoryFormPage, val)    
  }
  
  submitScan(value=false){
  }

  init_inventory_list() {
    var domain = this.get_inventory_domain()
    console.log(domain)

    this.stockInfo.get_inventory_movements(domain, 'tree').then((lines:Array<{}>) => {
      this.full_inventory_list = []
      for (var line in lines){
        lines[line]['index']=line
        this.full_inventory_list.push(lines[line])
        this.inventory_filter('type', this.inventory_type_filter)
      }
    })
    .catch((mierror) => {
      this.full_inventory_list = []
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros')
    })
  }

  inventory_filter(inventory_type, value) {
    this.inventory_type_filter = value
    if (inventory_type=='type'){
      if (value !=0){
        this.current_inventory_list = this.full_inventory_list.filter(x => x['state']==value)
      }
      else {
        this.current_inventory_list = this.full_inventory_list
      }
    }
    for (var i in this.current_inventory_list){
      this.current_inventory_list[i]['index'] = i
    }
  }

  get_inventory_domain(){
    var domain = []
    if (this.inventory_type_filter != 0 && this.inventory_type_filter != undefined){
      domain = [['state', '=', this.inventory_type_filter]]
    } else {
      domain = ['|', ['state', '=', 'draft'], ['state', '=', 'confirm']]
    }
   return domain
  }

  new_inventory_item() {
    this.navCtrl.setRoot(StockInventoryCreatePage)
  }
  

  
}


