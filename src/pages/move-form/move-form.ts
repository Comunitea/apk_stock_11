import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { PickingFormPage } from '../picking-form/picking-form';

/**
 * Generated class for the MoveFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-move-form',
  templateUrl: 'move-form.html',
})
export class MoveFormPage {

  model: any
  id: any
  move_data: {}

  constructor(public navCtrl: NavController, public navParams: NavParams, private stockInfo: StockProvider, private changeDetectorRef: ChangeDetectorRef) {
    this.model = Number(this.navParams.data.model)
    this.id = this.navParams.data.id
    this.get_move_data(this.id)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MoveFormPage');
  }

  get_move_data(id) {
    
    this.stockInfo.get_component_info(id, 'stock.move').then((lines:Array<{}>)=> {
      this.move_data = lines
      console.log(lines)
      this.changeDetectorRef.detectChanges();
    })
    .catch((mierror) => {
      this.move_data = []
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar el pick')
    })


    return
  }

}
