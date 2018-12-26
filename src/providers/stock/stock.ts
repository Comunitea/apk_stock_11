
import { Injectable } from '@angular/core';
import { OdooProvider } from '../odoo/odoo';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/*
  Generated class for the StockProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StockProvider {

  STOCK_FIELDS = {
    'stock.picking.type': {
      'form': ['id', 'name', 'code', 'warehouse_id', 'default_location_src_id', 'default_location_dest_id'],
      'tree': ['id', 'name', 'code', 'warehouse_id', 'default_location_src_id', 'default_location_dest_id']},
    'stock.picking':{
      'form':  ['id', 'name', 'state', 'partner_id', 'scheduled_date', 'batch_picking_id', 'location_id', 'location_dest_id', 'note', 'picking_type_id', 'move_lines'],
      'tree':  ['id', 'name', 'state', 'scheduled_date', 'batch_picking_id', 'picking_type_id']},

    'stock.move':{
      'form': ['id', 'name', 'has_tracking', 'state', 'product_id', 'product_uom', 'scheduled_date', 'picking_id', 'location_id', 'location_dest_id', 'product_uom_qty', 'lot_id', 'package_id', 'product_qty','result_package_id', 'display_name'],
      'tree': ['id', 'product_id', 'has_tracking', 'product_uom', 'picking_id', 'product_qty', 'product_uom_qty', 'state']},
    'stock.move.line':{
      'form': ['id', 'name', 'move_id', 'state', 'product_id', 'scheduled_date', 'picking_id', 'location_id', 'location_dest_id', 'product_uom_qty', 'lot_id', 'package_id', 'product_qty', 'qty_done', 'result_package_id', 'display_name'],
      'tree': ['id', 'product_id', 'move_id', 'lot_id', 'picking_id', 'product_qty', 'product_uom_qty', 'qty_done', 'state']},
  }


                                


  STOCK_STATES = {'draf': 'Borrador',
                    'waiting': 'Esperando',
                    'confirmed': 'En espera',
                    'assigned': 'Reservado',
                    'partially_available': 'Parcialmente',
                    'done': 'Hecho',
                    'cancel': 'Cancelado'}

  STATE_ICONS={
    'cancel':'trash', 
    'error': 'alert', 
    'done': 'checkmark-circle', 
    'waiting': 'clock', 
    'confirmed': 'checkmark',
    'partially_available': 'checkmark',
    'assigned': 'done-all', 
    'draft': 'close-circle'}
  picking_types         

  constructor(private odooCon: OdooProvider, public alertCtrl: AlertController, public storage: Storage)  {
    console.log('Hello StockProvider Provider');
    this.picking_types = this.get_picking_types(false)
  }
  init_values(){
    this.get_picking_types()
  }
  get_picking_types(domain=false){
    var picking_type_domain
    var self = this
    if (domain){
      picking_type_domain = picking_type_domain.push(domain)
      }
    var model = 'stock.picking.type'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, picking_type_domain, fields, 0, 0).then((pt_ids) => {
        this.storage.set('PICKING_TYPES', pt_ids).then(() => {
          this.picking_types = pt_ids
          console.log(pt_ids)
          resolve(pt_ids)
        })
      })
      .catch((err) => {
        this.picking_types = false
        reject(false)
        console.log("Error buscando " + model)
    });
    })
    return promise
  }




  get_stock_picking(domain, type='tree'){
    
    var self = this
    var model = 'stock.picking'
    var fields = this.STOCK_FIELDS[model][type]
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids) => {
       for (var sm_id in sp_ids){sp_ids[sm_id]['model'] = model}
       resolve(sp_ids)
      })
      .catch((err) => {
        reject(false)
        console.log("Error buscando " + model)
    });
    })
    return promise
  }
  
    get_stock_move(domain, type='tree', model='stock.move.line'){
    
      var self = this
      var fields = this.STOCK_FIELDS[model][type]
     
      var promise = new Promise( (resolve, reject) => {
        self.odooCon.search_read(model, domain, fields, 0, 0).then((sm_ids:Array<{}>) => {
          for (var sm_id in sm_ids){sm_ids[sm_id]['model'] = model}
          if (model=='stock.move'){
            self.odooCon.search_read('stock.move.line', domain, this.STOCK_FIELDS['stock.move.line'][type], 0, 0).then((sml_ids:Array<{}>) => {
              if (sml_ids){
                for (var sm_id in sml_ids){
                  sml_ids[sm_id]['model'] = 'stock.move.line'
                  var move_id = sm_ids.filter(x=>x['id'] == sml_ids[sm_id]['move_id'][0])
                  sml_ids[sm_id]['has_tracking'] = move_id && move_id[0]['has_tracking']
                }
                for (sm_id in sm_ids){
                  sm_ids['model'] = model
                  sm_ids[sm_id]['move_line_ids'] = sml_ids.filter(x=> x['move_id'][0] == sm_ids[sm_id]['id'])
                }
            }
            })
            .catch((err) => {
              reject(false)
              console.log("Error buscando " + 'stock.move.line')
          }); 
          }
        resolve(sm_ids)

        })
        .catch((err) => {
          reject(false)
          console.log("Error buscando " + model)
      });
      })
      return promise  
} 


  
  
  presentAlert(titulo, texto) {
    const alert = this.alertCtrl.create({
        title: titulo,
        subTitle: texto,
        buttons: ['Ok'],
    });
    alert.present();
  }

  
}
