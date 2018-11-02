/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Item" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or an "Animal," or something like that.
 *
 * The Items service manages creating instances of Item, so go ahead and rename
 * that something that fits your app as well.
 */
import { Storage } from '@ionic/storage';
import { OdooConnectorProvider } from '../providers/odoo-connector/odoo-connector';
import { OdooToolsProvider } from '../providers/odoo-tools/odoo-tools'

export class StockPickingType {
    
    model='stock.picking.type'
    default_domain = ['show_in_pda', '=', true]
    DEFAULT_SHOW_STATES = ['assigned', 'confirmed']

    constructor(fields: any, public storage: Storage,  private odootools: OdooToolsProvider, public odoo: OdooConnectorProvider) {
      // Quick and dirty extend/assign fields to this model
      for (const f in fields) {
        // @ts-ignore
        this[f] = fields[f];
      }
      
    }

    

}


  