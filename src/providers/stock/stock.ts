
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
      'tree': ['id', 'name', 'code', 'warehouse_id', 'default_location_src_id', 'default_location_dest_id']
    },

    'stock.picking':{
      'form':  ['id', 'name', 'state', 'partner_id', 'scheduled_date', 'location_id', 'location_dest_id', 'note', 'picking_type_id', 'move_lines'],
      'tree':  ['id', 'name', 'state', 'scheduled_date', 'picking_type_id']
    },

    'stock.move':{
      'form': ['id', 'name', 'has_tracking', 'state', 'product_id', 'product_uom', 'scheduled_date', 'picking_id', 'location_id', 'location_dest_id', 'product_uom_qty', 'lot_id', 'package_id', 'product_qty','result_package_id', 'display_name', 'need_check', 'need_dest_check'],
      'tree': ['id', 'product_id', 'has_tracking', 'product_uom', 'picking_id', 'product_qty', 'product_uom_qty', 'state'],
      'inview': ['product_id', 'product_uom_qty', 'state'],
    },

    'stock.move.line':{
      'form': ['id', 'move_id', 'state', 'product_id', 'picking_id', 'location_id', 'location_dest_id', 'product_uom_qty', 'lot_id', 'package_id', 'product_qty', 'qty_done', 'result_package_id', 'display_name', 'barcode_dest', 'barcode', 'lot_name', 'ordered_qty', 'need_check', 'need_dest_check', 'original_location_short_name', 'final_location_short_name', 'product_short_name', 'product_barcode', 'product_need_check'],
      'tree': ['id', 'product_id', 'move_id', 'lot_id', 'picking_id', 'product_qty', 'product_uom_qty', 'qty_done', 'state', 'ordered_qty'],
      'done': ['id', 'qty_done']
    },

    'product.product': {
      'form': ['id', 'default_code', 'barcode', 'product_tmpl_id', 'product_tmpl_name', 'tracking'],
      'tree': ['id', 'default_code', 'barcode']
    },

    'product.template': {
      'form': ['id', 'name'],
      'tree': ['id', 'name']
    },

    'stock.production.lot': {
      'form': ['id', 'name', 'product_id', 'product_short_name', 'product_tracking'],
      'tree': ['id', 'name', 'product_id']
    },

    'stock.location': {
      'form': ['id', 'complete_name', 'barcode', 'need_dest_check', 'name', 'location_id'],
      'tree': ['need_dest_check'],
      'check': ['need_check']
    },

    'stock.quant.package': {
      'form': ['id', 'name', 'mono_product', 'lot_id', 'location_id', 'location_barcode', 'product_id', 'product_short_name', 'product_tracking', 'quant_ids'],
      'tree': ['mono_product', 'lot_id', 'location_id']
    },

    'stock.quant': {
      'form': ['id', 'product_id', 'location_id', 'lot_id', 'package_id', 'quantity', 'reserved_quantity', 'product_tracking'],
      'tree': ['id', 'product_id', 'location_id', 'quantity', 'reserved_quantity']
    },

    'stock.inventory': {
      'form': ['name', 'date', 'state', 'location_id', 'filter', 'product_id', 'package_id', 'lot_id', 'category_id', 'line_ids', 'move_ids', 'original_location_short_name', 'original_product_short_name'],
      'tree': ['id', 'name', 'date', 'state']
    },

    'stock.inventory.line': {
      'form': ['inventory_id', 'product_name', 'product_barcode', 'location_id', 'package_id', 'prod_lot_id', 'theoretical_qty', 'product_qty', 'original_location_short_name'],
      'tree': ['product_name', 'location_id', 'package_id', 'prodlot_name', 'theoretical_qty', 'product_qty', 'original_location_short_name'],
      'write': ['product_qty']
    }

  }                            

  STOCK_STATES = {
    'draf': 'Borrador',
    'waiting': 'Esperando',
    'confirmed': 'En espera',
    'assigned': 'Reservado',
    'partially_available': 'Parcialmente',
    'done': 'Hecho',
    'cancel': 'Cancelado'
  }

  STATE_ICONS = {
    'cancel':'trash', 
    'error': 'alert', 
    'done': 'checkmark-circle', 
    'waiting': 'clock', 
    'confirmed': 'checkmark',
    'partially_available': 'checkmark',
    'assigned': 'done-all', 
    'draft': 'close-circle'
  }

  picking_types         

  constructor(private odooCon: OdooProvider, public alertCtrl: AlertController, public storage: Storage)  {
    console.log('Hello StockProvider Provider');
    this.picking_types = this.get_picking_types([])
  }

  init_values(){
    this.get_picking_types()
  }

  get_picking_types(domain=[]){
    var picking_type_domain=[[]]
    var self = this
    if (domain){
      picking_type_domain.push(domain)
      }
    var model = 'stock.picking.type'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((pt_ids) => {
        this.storage.set('PICKING_TYPES', pt_ids).then(() => {
          this.picking_types = pt_ids
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

  get_current_picking_type(id) {
    var self = this
    var model = 'stock.picking.type'
    var fields = this.STOCK_FIELDS[model]['form']
    var domain = [['id', '=', id]]

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

  validate_picking(values){
    var self = this
    var model 
    var valores = {
      'picking_id': values['id'],
      'location_dest_id': values['location_dest_id'],
      'location_id': values['location_id'],
      'move_lines': values['move_lines'],
      'move_lines_ids': values['moves'],
      'picking_type_id': values['picking_type_id'],
    }
     
    model = 'stock.picking'
    var promise = new Promise( (resolve, reject) => {
      console.log(valores)
      self.odooCon.execute(model, 'button_validate_from_pda', valores).then((done) => {
       return done
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  picking_line_to_done(model, move_id, values){
      
    var self = this
    var model = model
    var move_id = move_id
    var valores = {
      'qty_done': values['qty_done'],
      'package_id': values['package_id'][0],
      'lot_id': values['lot_id'][0],
      'lot_name': values['lot_id'][1],
      'result_package_id': values['result_package_id'][0],
      'location_id': values['location_id'][0],
      'location_dest_id': values['location_dest_id'][0],
      'barcode': values['barcode'],
      'barcode_dest': values['barcode_dest']
    }
    
    var promise = new Promise( (resolve, reject) => {
        self.odooCon.update_lines(model, 'write', valores, move_id).then((sp_ids) => {
          for (var sm_id in sp_ids){sp_ids[sm_id]['model'] = model}
          resolve(sp_ids)
        })
        .catch((err) => {
          reject(false)
          console.log("Error al validar")
      });
      });
    return promise
  }

  create_new_package(model, name){
    var self = this
    var pckg_model = model
    var name = name
    var pckg_values = {
      'name': name
    }
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.new_package(pckg_model, pckg_values).then((lineas:Array<{}>) => {
        resolve(lineas)
      })
      .catch((err) => {
        reject(false)
        console.log("Error")
      })
    })

    return promise
    
  }

  check_barcode(val, id) {
    var self = this
    var val = val
    var domain = [['barcode', '=', val], ['id', '=', id]]

    var model = 'product.product'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }

  check_production_lot(val, id) {
    var self = this
    var val = val
    var domain = [['name', '=', val], ['id', '=', id]]

    var model = 'stock.production.lot'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }

  get_product_by_barcode(val) {
    var self = this
    var val = val
    var domain = [['barcode', '=', val]]

    var model = 'product.product'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }

  check_if_location_barcode(val) {
    var self = this
    var val = val
    var domain = [['barcode', '=', val]]

    var model = 'stock.location'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }

  get_product_template(id) {
    var self = this
    var id = id
    var domain = [['id', '=', id]]

    var model = 'product.product'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)          
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }

  product_template_name(id) {
    var self = this
    var id = id
    var domain = [['id', '=', id]]

    var model = 'product.template'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }

  check_if_need_dest_check(id) {
    var self = this
    var id = id
    var domain = [['id', '=', id]]

    var model = 'stock.location'
    var fields = this.STOCK_FIELDS[model]['tree']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }
  
  check_if_need_check(id) {
    var self = this
    var id = id
    var domain = [['id', '=', id]]

    var model = 'stock.location'
    var fields = this.STOCK_FIELDS[model]['check']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }

  new_location_dest(id, barcode, move_id) {
    var self = this
    var id = id
    var barcode = barcode
    var model = 'stock.move.line'
    var valores = {
      'location_dest_id': id,
      'barcode_dest': barcode,
    }
    
    var promise = new Promise( (resolve, reject) => {
        self.odooCon.update_lines(model, 'write', valores, move_id).then((sp_ids) => {
          for (var sm_id in sp_ids){sp_ids[sm_id]['model'] = model}
          resolve(sp_ids)
        })
        .catch((err) => {
          reject(false)
          console.log("Error al validar")
      });
      });
    return promise
  }

  new_location_origin(id, barcode, move_id) {
    var self = this
    var id = id
    var barcode = barcode
    var model = 'stock.move.line'
    var valores = {
      'location_id': id,
      'barcode': barcode,
    }
    
    var promise = new Promise( (resolve, reject) => {
        self.odooCon.update_lines(model, 'write', valores, move_id).then((sp_ids) => {
          for (var sm_id in sp_ids){sp_ids[sm_id]['model'] = model}
          resolve(sp_ids)
        })
        .catch((err) => {
          reject(false)
          console.log("Error al validar")
      });
      });
    return promise
  }

  get_quant_package_info(id) {
    var self = this
    var id = id
    var domain = [['id', '=', id]]

    var model = 'stock.quant.package'
    var fields = this.STOCK_FIELDS[model]['tree']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }

  get_quants_pda(id, values) {
    var self = this
    var model 
    let valores = {
      'product_id': values['product_id'][0],
      'location_id': id,
      'lot_id': values['lot_id'][0],
      'package_id': values['package_id'][0],
      'need_qty': values['product_qty'],
      'first': 1,
      'owner_id': undefined,
      'strict': undefined
    }
     
    model = 'stock.quant'
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.quants_pda_check(model, 'get_quants_apk', valores).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        console.log(err)
        reject(false)
        console.log("Error al validar")
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

  errorAlert(model, move_id, data) {
    let subtitulo = 'No se ha podido guardar en el id ' + move_id + ' del modelo ' + model + ' el valor: ' + data
    const alertError = this.alertCtrl.create({
      title: 'Error',
      subTitle: subtitulo,
      buttons: ['OK']
    });
    alertError.present();
  }


  // stock.inventory

  get_inventory_movements(domain, type='tree') {
    var self = this
    var model = 'stock.inventory'
    var fields = this.STOCK_FIELDS[model][type]
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((sp_ids) => {
       for (var sm_id in sp_ids){sp_ids[sm_id]['model'] = model}
       resolve(sp_ids)
      })
      .catch((err) => {
        console.log(err)
        reject(false)
        console.log("Error buscando " + model)
    });
    })
    return promise
  }

  get_inventory_movement_info(id) {
    var self = this
    var id = id
    var domain = [['id', '=', id]]

    var model = 'stock.inventory'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        console.log(err)
        reject(err)
    });
    })
    return promise
  }

  get_inventory_line_info(id, type='tree') {
    var self = this
    var domain = [['id', '=', id]]
    var model = 'stock.inventory.line'
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

  get_available_quants(warehouse, product, lot_id = undefined, package_id = undefined, strict = undefined) {
    var self = this
    let valores = {
      'product_id': product,
      'location_id': warehouse,
      'lot_id': lot_id,
      'package_id': package_id,
      'need_qty': undefined,
      'first': 0,
      'owner_id': undefined,
      'strict': strict
    }

    var model = 'stock.quant'
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'get_quants_apk', valores).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })

    return promise
  }


  inventory_action_create(values){
    var self = this
    var model 

    let valores = {
      'filter': values['filter'],
      'location_id': values['location_id'][0],
      'lot_id': values['lot_id'][0],
      'package_id': values['package_id'][0],
      'product_id': values['product_id'][0],
      'name': values['name'],
      'state': 'draft'
    }

    model = 'stock.inventory'
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'action_create_apk', valores).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  inventory_action_execute(id, action){
    var self = this
    var model 
    var id = id
    var action = action

    model = 'stock.inventory'
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, action, id).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  update_inventory_line_product_qty(line_id, product_qty){
      
    var self = this
    var model = 'stock.inventory.line'
    var move_id = line_id
    var valores = {
      'product_qty': product_qty
    }
    
    var promise = new Promise( (resolve, reject) => {
        self.odooCon.update_lines(model, 'write', valores, move_id).then((sp_ids) => {
          for (var sm_id in sp_ids){sp_ids[sm_id]['model'] = model}
          resolve(sp_ids)
        })
        .catch((err) => {
          reject(false)
          console.log("Error al validar")
      });
      });
    return promise
  }

  get_inventory_stock_move(id, type='inview') {
    var self = this
    var domain = [['id', '=', id]]
    var model = 'stock.move'
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

  get_possible_locations(warehouse, barcode, type='form') {
    var self = this
    var domain = [['id', 'child_of', warehouse], ['barcode', '=', barcode]]
    var model = 'stock.location'
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

  inventory_line_create(values){
    var self = this
    var model 

    model = 'stock.inventory.line'
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'create', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  check_if_package_in_warehouse(barcode, warehouse, type='form') {
    var self = this
    var domain = [['name', '=', barcode], ['location_id', 'child_of', warehouse]]
    var model = 'stock.quant.package'
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

  check_if_production_lot(val) {
    var self = this
    var val = val
    var domain = [['name', '=', val]]

    var model = 'stock.production.lot'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        console.log(err)
        reject(err)
    });
    })
    return promise
  }

  get_quants_info(val) {
    var self = this
    var val = val
    var domain = [['id', 'in', val]]

    var model = 'stock.quant'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        console.log(err)
        reject(err)
    });
    })
    return promise
  }

  get_lines_quants(lines, package_id) {
    var self = this
    var model 
    var values = {
      'lines': lines,
      'package': package_id
    }
     
    model = 'stock.inventory.line'
    var promise = new Promise( (resolve, reject) => {
      self.odooCon.execute(model, 'get_quants_for_line_apk', values).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }
  
}
