import { Injectable } from '@angular/core';
import { OdooProvider } from '../odoo/odoo';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/*
  Generated class for the StockProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ProductProvider {

  STOCK_FIELDS = {
    'product.template': {
      'form': ['id', 'name', 'description', 'type', 'categ_id', 'list_price', 'weight', 'default_code', 'image_medium', 'tracking'],
      'tree': ['id', 'name', 'description', 'type', 'categ_id', 'list_price', 'weight', 'default_code', 'image_medium', 'tracking'],
      'id': ['id']
    },
    'stock.move': {
      'form': ['id', 'reference', 'product_id', 'picking_id', 'inventory_id'],
      'tree': ['id', 'reference', 'product_id', 'picking_id']
    },
    'stock.production.lot': {
      'form': ['id', 'name', 'ref', 'product_id', 'create_date'],
      'tree': ['id', 'name', 'product_id']      
    },
    'product.product': {
      'form': ['id', 'product_tmpl_id'],
      'tree': ['id', 'product_tmpl_id']
    },
    'stock.move.line': {
      'form': ['id', 'picking_id', 'ordered_qty', 'qty_done', 'lot_id', 'date', 'location_id', 'location_dest_id', 'state', 'reference'],
      'tree': ['id', 'picking_id', 'ordered_qty', 'qty_done', 'lot_id', 'date', 'location_id', 'location_dest_id', 'state', 'reference']
    }
  }                             

  constructor(private odooCon: OdooProvider, public alertCtrl: AlertController, public storage: Storage)  {
    console.log('Hello ProductProvider Provider');
    
  }

  get_product_data(domain, type='tree', offset, limit){
    var limit = limit
    var offset = offset
    
    if(offset < 0) {
      offset = 0
    }

    offset = offset*50
    
    var model = 'product.template'
    var fields = this.STOCK_FIELDS[model][type]
    var promise = new Promise( (resolve, reject) => {
      this.odooCon.search_read(model, domain, fields, offset, limit).then((sp_ids) => {
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

  get_last_movements(domain, type='form'){
    
    var model = 'stock.move'
    var fields = this.STOCK_FIELDS[model][type]
    var promise = new Promise( (resolve, reject) => {
      this.odooCon.search_read(model, domain, fields, 0, 5, 'id DESC').then((sp_ids) => {
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

  get_product_real_id(domain, type='form'){
    
    var model = 'product.product'
    var fields = this.STOCK_FIELDS[model][type]
    var promise = new Promise( (resolve, reject) => {
      this.odooCon.search_read(model, domain, fields, 0, 1).then((sp_ids) => {
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

  get_last_lots(domain, type='tree'){
  
    var model = 'stock.production.lot'
    var fields = this.STOCK_FIELDS[model][type]
    var promise = new Promise( (resolve, reject) => {
      this.odooCon.search_read(model, domain, fields, 0, 5, 'id DESC').then((sp_ids) => {
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

  get_lot_info(domain, type='form'){
    
    var model = 'stock.production.lot'
    var fields = this.STOCK_FIELDS[model][type]
    var promise = new Promise( (resolve, reject) => {
      this.odooCon.search_read(model, domain, fields, 0, 0,).then((sp_ids) => {
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

  get_lot_lines(domain, type='form'){
    
    var model = 'stock.move.line'
    var fields = this.STOCK_FIELDS[model][type]
    var promise = new Promise( (resolve, reject) => {
      this.odooCon.search_read(model, domain, fields, 0, 0, 'date DESC').then((sp_ids) => {
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
  
  presentAlert(titulo, texto) {
    const alert = this.alertCtrl.create({
        title: titulo,
        subTitle: texto,
        buttons: ['Ok'],
    });
    alert.present();
  }

  get_total_products() {
    var model 
    var domain = [['type', '=', 'product']]
     
    model = 'product.template'
    var promise = new Promise( (resolve, reject) => {
      this.odooCon.execute(model, 'search_count', domain).then((done) => {
       resolve(done)
      })
      .catch((err) => {
        reject(false)
        console.log("Error al validar")
    });
    })
    
    return promise
  }

  get_next_template_id(name, option){
    var model
    if (option == 0) {
      var domain = [['name', '<', name], ['type', '=', 'product']]
      var filter = 'name DESC, default_code'
    } else if (option == 1) {
      var domain = [['name', '>', name], ['type', '=', 'product']]
      var filter = 'name, default_code'
    }

    model = 'product.template'
    var type = 'id'
    var fields = this.STOCK_FIELDS[model][type]
    var promise = new Promise( (resolve, reject) => {
      this.odooCon.search_read(model, domain, fields, 0, 1, filter).then((sp_ids) => {
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

  get_last_product_id(){
    var model
    var domain = [['type', '=', 'product']]
    var filter = 'name DESC'


    model = 'product.template'
    var type = 'id'
    var fields = this.STOCK_FIELDS[model][type]
    var promise = new Promise( (resolve, reject) => {
      this.odooCon.search_read(model, domain, fields, 0, 1, filter).then((sp_ids) => {
       resolve(sp_ids)
      })
      .catch((err) => {
        reject(false)
        console.log("Error buscando " + model)
    });
    })
    return promise
  }

  get_first_product_id(){
    var model
    var domain = [['type', '=', 'product']]
    var filter = 'name ASC'


    model = 'product.template'
    var type = 'id'
    var fields = this.STOCK_FIELDS[model][type]
    var promise = new Promise( (resolve, reject) => {
      this.odooCon.search_read(model, domain, fields, 0, 1, filter).then((sp_ids) => {
       resolve(sp_ids)
      })
      .catch((err) => {
        reject(false)
        console.log("Error buscando " + model)
    });
    })
    return promise
  }

  get_product_by_barcode(val) {
    var val = val
    var domain = ['|', ['barcode', '=', val], ['default_code', '=', val]]

    var model = 'product.product'
    var fields = this.STOCK_FIELDS[model]['form']
    var promise = new Promise( (resolve, reject) => {
      this.odooCon.search_read(model, domain, fields, 0, 0).then((data) => {
        for (var sm_id in data){data[sm_id]['model'] = model}
          resolve(data)
      })
      .catch((err) => {
        reject(err)
    });
    })
    return promise
  }

  
}
