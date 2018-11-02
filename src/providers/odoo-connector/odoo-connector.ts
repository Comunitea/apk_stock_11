import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
/*
  Generated class for the OdooConnectorProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
import { OdooToolsProvider } from '../../providers/odoo-tools/odoo-tools'

declare var OdooApi: any;

@Injectable()
export class OdooConnectorProvider {
  context = {'lang': 'es_ES', 'from_pda': true}
  uid = 0
  active_conexion

  constructor(private storage: Storage, public odootools: OdooToolsProvider) {
    // this.context = {'lang': 'es_ES', 'from_pda': true}
    // this.uid = 0
    console.log('Hello OdooConnectorProvider Provider');
  }

  get_conexion(con_data){
    var self = this
    var promise = new Promise( (resolve, reject) => {
      
      var odoo = new OdooApi(con_data.url, con_data.db);

      odoo.login(con_data.username, con_data.password).then( (uid) => {
        self.uid = uid
        odoo.context = self.context
        this.active_conexion = odoo
        resolve(odoo)
        })
        .catch( (mierror) => {
        var err = {'title': 'Error!', 'msg': 'No se pudo conectar con Odoo'}
        reject(false);
        });
      });
    return promise
    }

  

  login(user, password){
    var method = method
    var values = values
    var self = this
    var promise = new Promise( (resolve, reject) => {
        self.storage.get('odoo_conexion').then((con_data) => {
            var odoo = new OdooApi(con_data.url, con_data.db);
            // this.navCtrl.setRoot(HomePage, {borrar: true, login: null});
            if (con_data == null) {
                var err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
                reject(err);
            } else {
                odoo.context = self.context
                odoo.login(con_data.username, con_data.password).then( (uid) => {
                self.uid = uid
                resolve(uid)
                })
                .catch( (mierror) => {
                  var err = {'title': 'Error!', 'msg': 'No se pudo conectar con Odoo'}
                  reject(err);
                });
            }
        });
    });
    return promise
}

search_read(model, domain, fields, offset = 0, limit = 0, order = ''){
 
  var model = model;
  var domain = domain;
  var fields = fields;
  var self = this
  var promise = new Promise( (resolve, reject) => {
    self.active_conexion.search_read(model, domain, fields, offset, limit, order).then((res) => {
      resolve(res);
      })
    .catch(() => {
      var err = {'title': 'Error!', 'msg': 'Fallo al llamar al hacer search_read'}
      reject(err);
      });
  })
  return promise
}

search(model='ir.model', domain, fields, offset = 0, limit=50, order=''){
  var method = 'search_read_obj'
  var values = {'domain': domain, 'fields': fields, 'offset': offset, 'limit': limit, 'order': order}
  var self = this
  var promise = new Promise( (resolve, reject) => {
      self.active_conexion.call(model, method, values).then((res) => {
        resolve(res);
      })
      .catch( () => {
        var err = {'title': 'Error!', 'msg': 'Fallo al llamar al método ' + method + 'del modelo app.regustry'}
        reject(err);
    })});
  return promise
}
write (model, id, data){    
  var self = this
  var promise = new Promise((resolve, reject) => {
    self.active_conexion.write(model, id, data).then((res) => {
      resolve(res);
      })
    .catch(() => {
      var err = {'title': 'Error!', 'msg': 'Fallo al llamar al hacer un write'}
      reject(err);
    });
  })
  return promise
}

execute(model, method, values) {

  var method = method
  var values = values
  var self = this
  var promise = new Promise( (resolve, reject) => {
      self.active_conexion.call(model, method, values).then((res) => {
        resolve(res);
      })
      .catch( () => {
        var err = {'title': 'Error!', 'msg': 'Fallo al llamar al método ' + method + 'del modelo app.regustry'}
        reject(err);
    })});
  return promise
  }


execute2(model, method, values) {
    
    var method = method
    var values = values
    var self = this
    var promise = new Promise( (resolve, reject) => {
        self.storage.get('odoo_conexion').then((con_data) => {
            var odoo = new OdooApi(con_data.url, con_data.db);
            odoo.context = self.context
            // this.navCtrl.setRoot(HomePage, {borrar: true, login: null});
            if (con_data == null) {
                var err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
                reject(err);
            } else {
                odoo.login(con_data.username, con_data.password).then((uid) => {
                        odoo.call(model, method, values).then((res) => {
                            resolve(res);
                        })
                        .catch( () => {
                            var err = {'title': 'Error!', 'msg': 'Fallo al llamar al método ' + method + 'del modelo app.regustry'}
                            reject(err);
                        });
                })
                .catch( () => {
                    var err = {'title': 'Error!', 'msg': 'No se pudo conectar con Odoo'}
                    reject(err);
                });
            }
        });
    });
    return promise
}
/*domain=None, fields=None, offset=0, limit=None, order=None, context=None*/
write2 (model, id, data){
    
    var self = this
    var promise = new Promise( (resolve, reject) => {
        self.storage.get('odoo_conexion').then((con_data) => {
            var odoo = new OdooApi(con_data.url, con_data.db);
            odoo.context = self.context
            if (con_data == null) {
                var err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
                reject(err);
            } else {
                odoo.login(con_data.username, con_data.password).then( (uid) => {
                    odoo.write(model, id, data).then((res) => {
                        resolve(res);
                    })
                    .catch( () => {
                        var err = {'title': 'Error!', 'msg': 'Fallo al llamar al hacer un write'}
                        reject(err);
                    });
                })
                .catch( () => {
                    var err = {'title': 'Error!', 'msg': 'No se pudo conectar con Odoo'}
                    reject(err);
                });
            }
        });
    });
    return promise
}
searchRead_2(model, domain, fields, offset = 0, limit = 0, order = ''){
  var model = model;
  var domain = domain;
  var fields = fields;
  var self = this
  var promise = new Promise( (resolve, reject) => {
      self.storage.get('odoo_conexion').then((con_data) => {
          var odoo = new OdooApi(con_data.url, con_data.db);
          odoo.context = self.context
          if (con_data == null) {
              var err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
              reject(err);
          } else {
            odoo.uid = this
            odoo.search_read(model, domain, fields, offset, limit, order).then((res) => {
                resolve(res);
            })
            .catch( () => {
                var err = {'title': 'Error!', 'msg': 'Fallo al llamar al hacer search_read'}
                reject(err);
            });
             
          }
      });
  });
  return promise
}



search_read2(model, domain, fields, offset = 0, limit = 0, order = ''){
    var model = model;
    var domain = domain;
    var fields = fields;
    var self = this
    var promise = new Promise( (resolve, reject) => {
        self.storage.get('odoo_conexion').then((con_data) => {
            
            if (con_data == null) {
                var err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
                reject(err);
            } else {
                var odoo = new OdooApi(con_data.url, con_data.db);
                odoo.context = self.context
                odoo.login(con_data.username, con_data.password).then( (uid) => {
                
                odoo.search_read(model, domain, fields, offset, limit, order).then((res) => {
                    resolve(res);
                })
                .catch( () => {
                    var err = {'title': 'Error!', 'msg': 'Fallo al llamar al hacer search_read'}
                    reject(err);
                });
                })
                .catch( () => {
                    var err = {'title': 'Error!', 'msg': 'No se pudo conectar con Odoo'}
                    reject(err);
                });
            }
        });
    });
    return promise
}


search_read3(model, domain, fields, offset = 0, limit = 0, order = ''){
  var model = model;
  var domain = domain;
  var fields = fields;
  var self = this
  var promise = new Promise( (resolve, reject) => {
      self.storage.get('odoo_conexion').then((con_data) => {
          
          if (con_data == null) {
              var err = {'title': 'Error!', 'msg': 'No hay datos para establecer la conexión'}
              reject(err);
          } else {
              var odoo = new OdooApi(con_data.url, con_data.db);
              odoo.context = self.context
              odoo.login(con_data.username, con_data.password).then( (uid) => {
              
              odoo.search_read(model, domain, fields, offset, limit, order).then((res) => {
                  resolve(res);
              })
              .catch( () => {
                  var err = {'title': 'Error!', 'msg': 'Fallo al llamar al hacer search_read'}
                  reject(err);
              });
              })
              .catch( () => {
                  var err = {'title': 'Error!', 'msg': 'No se pudo conectar con Odoo'}
                  reject(err);
              });
          }
      });
  });
  return promise
}


}
