import {NavController, NavParams, AlertController} from 'ionic-angular';
import {Component} from '@angular/core';    

import {Storage} from '@ionic/storage';
import {ListPage} from '../../pages/list/list';
import { OdooProvider } from '../../providers/odoo/odoo';
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
        db: 'test_o11',
        username: 'admin',
        password: 'admin',
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

    constructor(public navCtrl: NavController, public navParams: NavParams, 
                private storage: Storage, public alertCtrl: AlertController,
                private odoo: OdooProvider) {
	
        if (this.navParams.get('login')){
            this.CONEXION.username = this.navParams.get('login')
        };
        this.check_storage_conexion(this.navParams.get('borrar'))
        if (this.navParams.get('borrar') == true){
            this.cargar = false;
        }
        else {
            // Autologin al cargar app
            this.cargar = true;
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
        var fields = ['id', 'login', 'image', 'name', 'company_id']
        this.odoo.login(con.username, con.password).then ((uid) => {
            this.odoo.uid = uid
            this.odoo.search_read(model, domain, fields).then((value) => {
                var user = {id: null, name: null, image: null, login: null, cliente_id: null, company_id: null};
                if (value) {
                    this.storage.set('USER', value).then(() => {
                    this.cargar=false
                    this.navCtrl.setRoot(PickingListPage);
                  })
                }
            })
            .catch(() => {
                this.cargar = false;
                this.presentAlert('Error!', 'No se pudo encontrar el usuario:' + con.username);
            });
        })
    }
}
