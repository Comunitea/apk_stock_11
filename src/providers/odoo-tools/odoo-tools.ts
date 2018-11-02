import { HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController, AlertController } from 'ionic-angular';

/*
  Generated class for the OdooToolsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/


@Injectable()
export class OdooToolsProvider {
  
  conexion: any

  presentToast(message, duration=30, position='top') {
    let toast = this.toast.create({
      message: message,
      duration: duration,
      position: position
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }


  presentAlert(title, message) {
    const alert = this.alertCtrl.create({
        title: title,
        subTitle: message,
        buttons: ['Ok']
    });
    alert.present();
  }




  constructor(public http: HttpClientModule, public toast: ToastController, public alertCtrl: AlertController) {
    console.log('Hello OdooToolsProvider Provider');
    //this.conexion = new OdooConexion
  }
  get_ids(values){
    let ids = []
    for (let id in values){
      ids.push(values[id]['id'])
    }
    return ids
  }
  compute_qty_apk(from_unit, to_unit, qty, conexion){
    let self = this
    let values = {'from_unit': from_unit, 'to_unit': to_unit, 'qty': qty}
    let res={}
    conexion.execute_kw('product.uom', 'compute_qty_apk', values, function(err, values){
      if(err){
        self.presentToast("Error al acceder a odoo")
        res = {'err': true, 'error': err}
        }
      if (values){
        res = values && values[0]
      }   
      return res      
    })
  }

  search_read(conexion, model, method, params){
    let self = this
    let res={}
    conexion.execute_kw(model, method, params, function(err, values){
      if(err){
        self.presentToast("Error al acceder a odoo")
        res = {'err': true, 'error': err}
        }
      if (values){
        res = {'err': false, 'vals': values}
      }   
      return res      
    })


  }
  onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
  }

  filter_obj(values=[], object, filtered='', key='id')  {
    let res = []
    if (object=='picking.type'){key = 'id'}
    else if (object=='stock.picking'){key='state'}
    for (let val in values){
      if (values[val][key]==filtered){
        res.push(values[val])}
    }
    return res

  }

  
}
