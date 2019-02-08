import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { ProductProvider } from '../../providers/products/products'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { Storage } from '@ionic/storage';
import { HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { ProductListPage } from '../product-list/product-list';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { PickingFormPage } from '../picking-form/picking-form';
import { ProductFormPage } from '../product-form/product-form';



/**
 * Generated class for the LotFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'lot-form',
  templateUrl: 'lot-form.html',
})
export class LotFormPage {
  
  @ViewChild('scan') myScan ;
  lot_id: any 
  view_form: boolean
  view_tree: boolean
  index: number
  hide_scan_form: boolean
  max_index: number
  move_model: string
  ScanReader: FormGroup
  lot_lines: any
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let code 
    code = this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.scan_read(val)
    })
  
    }

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private storage: Storage, private sound: SoundsProvider, 
        private productInfo: ProductProvider, private formBuilder: FormBuilder, private scanner: ScannerProvider) {
          this.index = Number(this.navParams.data.index)
          this.max_index = this.navParams.data.lots_ids.length
          this.get_lot_id(this.index)
  }


  get_lot_id(id){
    var domain = [['id', '=', id]]
    this.productInfo.get_lot_info(domain, 'form').then((info:Array<{}>)=> {
      this.lot_id = info[0]
      console.log(this.lot_id)
      domain = [['lot_id', '=', this.lot_id['id']]]
      this.productInfo.get_lot_lines(domain, 'form').then((lines:Array<{}>)=> {
        this.lot_lines = lines
        console.log(this.lot_lines)
      })
    })
    .catch((mierror) => {
      this.lot_id = []
      this.productInfo.presentAlert('Error de conexión', 'Error al recuperar el pick')
    })
    return
  }

  open_pick(index: number = 0){
    this.index = this.index + Number(index)
    if (this.index >= this.max_index){this.index=0}
    if (this.index < 0 ){this.index=this.max_index-1}
    this.get_lot_id(this.navParams.data.lots_ids[this.index]['id'])
    this.sound.play('nav')
  }

  scan_read(val){
    //this.odootools.presentToast('Picking form ' + val)
  }

  open_form (model, id){

  }
}
