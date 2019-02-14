import {NavController, NavParams, AlertController} from 'ionic-angular';
import {Component} from '@angular/core';    

import {Storage} from '@ionic/storage';

import { OdooProvider } from '../../providers/odoo/odoo';
import { StockProvider } from '../../providers/stock/stock'
import { PickingListPage } from '../picking-list/picking-list';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

    loginData = {password: '', username: ''};
    CONEXION = {
        url: 'http://localhost',
        port: '8069',
        db: '',
        username: '',
        password: '',
        uid : 0,
        context: {},
        user: {}
    };
    CONEXION_local = {
        url: '',
        port: '',
        db: '',
        username: '',
        password: '', 
        uid : 0,
        context: {},
        user: {}
    };
    cargar = false;
    mensaje = '';
    available_warehouses = [];
    testRadioOpen:  boolean;
    testRadioResult;

    constructor(public navCtrl: NavController, public navParams: NavParams, 
                private storage: Storage, public alertCtrl: AlertController,
                private odoo: OdooProvider, private stockInfo: StockProvider) {
	
        if (this.navParams.get('login')){
            this.CONEXION.username = this.navParams.get('login')
        };
        this.check_storage_conexion(this.navParams.get('borrar'))
        if (this.navParams.get('borrar') == true){
            this.cargar = false;
        }
        else {
            // Autologin al cargar app
            this.cargar = false;
            this.conectarApp(false);
        }
    }

    check_storage_conexion(borrar) {
        // Fijamos siempre a false el parámetro borrar para no tener que teclear usuario y contraseña siempre
        borrar = false
        if (borrar){
            this.CONEXION = this.CONEXION_local;
        }	
        else {
            this.storage.get('CONEXION').then((val) => {
                if (val && val['username']){
                    this.CONEXION = val
                }
                else {
                    this.CONEXION = this.CONEXION_local;
                    this.storage.set('CONEXION', this.CONEXION).then(() => {
                    })
                }
            })
        }
    }

    presentAlert(titulo, texto) {
        const alert = this.alertCtrl.create({
            title: titulo,
            subTitle: texto,
            buttons: ['Ok']
        });
        alert.present();
    }

    conectarApp(verificar) {
        this.cargar = true;
        if (verificar){
            this.storage.set('CONEXION', this.CONEXION).then(() => {
                this.check_conexion(this.CONEXION)
            })
        }
        else {
            this.storage.get('CONEXION').then((val) => {
                var con;
                if (val == null) {//no existe datos         
                    this.cargar = false;
                    con = this.CONEXION;
                    if (con.username.length < 3 || con.password.length < 3) {
                        if (verificar) {
                            this.presentAlert('Alerta!', 'Por favor ingrese usuario y contraseña');
                        }
                        return;
                    }
                }
		          else {
                    //si los trae directamente ya fueron verificados
                    con = val;
                    if (con.username.length < 3 || con.password.length < 3) {
                        this.cargar = false;
                        return
                    }
              }
              if (con){
                this.storage.set('CONEXION', con).then(() => {
                      this.check_conexion(con)
                      this.cargar=false
                    })
                }
            })
        }
    }

    check_conexion(con) {	
        var model = 'res.users'
        var domain = [['login', '=', con.username]]
        var fields = ['id', 'login', 'image', 'name', 'company_id', 'company_ids']
        this.odoo.login(con.username, con.password).then ((uid) => {
            this.odoo.uid = uid
            this.odoo.search_read(model, domain, fields).then((value) => {
                var user = {id: null, name: null, image: null, login: null, cliente_id: null, company_id: null};
                if (value) {
                    this.storage.set('USER', value).then(() => {
                    this.cargar=false
                    if(value[0]['company_ids'].length == 1) {
                        this.storage.set('selected_warehouse', value[0]['company_id']).then(() => {
                            this.navCtrl.setRoot(PickingListPage);
                        })
                    } else {
                        this.get_warehouse_options(value[0]['company_ids'])
                    }                
                  })
                }
            })
            .catch(() => {
                this.cargar = false;
                this.presentAlert('Error!', 'No se pudo encontrar el usuario:' + con.username);
            });
        })
        .catch(() => {
            this.cargar = false;
            this.presentAlert('Error!', 'El usuario o contraseña son incorrectos.');
        });
    }

    get_warehouse_options(locations) {

        this.stockInfo.get_available_warehouse_info(locations, 'form').then((lines:Array<{}>) => {
            this.show_warehouse_options(lines)
        })
        .catch(() => {
            this.cargar = false;
            this.presentAlert('Error!', 'No se pueden recuperar los almacenes');
        });
        
    }

    show_warehouse_options(lines) {

        this.available_warehouses = lines
        let alert = this.alertCtrl.create();
        alert.setTitle('Selecciona un almacén');

        this.available_warehouses.forEach(warehouse => {

            alert.addInput({
                type: 'radio',
                label: warehouse['name'],
                value: warehouse['company_id'][0]
            })

        });

        alert.addButton('Cancel');
        alert.addButton({
            text: 'Ok',
            handler: data => {
                this.testRadioOpen = false;
                this.testRadioResult = data;
                this.storage.set('selected_warehouse', data).then(() => {
                    this.navCtrl.setRoot(PickingListPage);
                })
            }
        });
        alert.present();

    }
}
