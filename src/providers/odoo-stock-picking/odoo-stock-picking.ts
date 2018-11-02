import { HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';


/*
  Generated class for the OdooStockPickingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class OdooStockPickingProvider {
  model='stock.picking'
  default_domain = ['', '=', true]
  DEFAULT_SHOW_STATES = ['assigned', 'confirmed']
  DEFAULT_DOMAIN = ['state', 'in', ['cancel', 'waiting', 'assigned', 'confirmed', 'done', 'draft']]
  
  DEFAULT_FIELDS = ['id', 'name', 'state', 'scheduled_date','delayed']

  DEFAULT_MOVE_FIELDS = ['id', 'name', 'product_id', 'product_uom_qty', 'qty_done', 'location_id', 'location_dest_id', 'state', 'product_uom']
  DEFAULT_MOVE_LINE_FIELDS = ['id', 'name', 'move_id', 'product_id', 'product_uom_qty', 'qty_done', 'location_id', 'location_dest_id', 'state', 'product_uom_id', 'package_id', 'result_package_id', 'lot_id', 'lot_name', ]
  STATE_ICONS={
    'cancel':'link_off', 
    'error': 'error', 
    'done': 'check_circle', 
    'waiting': 'timer', 
    'confirmed': 'timer',
    'assigned': 'done_outline', 
    'draft': 'notifications_off'}


  constructor(public http: HttpClientModule) {
    console.log('Hello OdooStockPickingProvider Provider');
    
  }

}
