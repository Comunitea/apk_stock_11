import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import {Storage} from '@ionic/storage';
import {MoveFormPage} from '../../pages/move-form/move-form';
import {PickingPage} from '../picking/picking';
import * as OdooConexion from 'odoo-xmlrpc';
import { OdooToolsProvider} from '../../providers/odoo-tools/odoo-tools'

//@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  cargar: Boolean
  login_server: Boolean
  CONEXION = {
		    url: '',
        port: '',
        db: '',
        username: '',
		    password: '',
        user: '',
        logged: false
  };
  CONEXION_local = {
    url: 'http://odoopistola.com/',
    port: '80',
    db: 'stock11',
    username: 'pda',
    password: 'cmnt',
    user: '',
    logged: false,
    uid: 0
  };
  conexion = {
    url: '',
    port: '',
    db: '',
    username: '',
    password: '',
    user: '',
    logged: false,
    uid: 0
  };

  constructor(public navCtrl: NavController, public storage: Storage, public navParams: NavParams, public alertCtrl: AlertController, public toast: ToastController, public odootools: OdooToolsProvider) {
    
    this.login_server = false
    this.storage.get('odoo_conexion').then((val) => {
      if (val) {
        this.conexion = val
        //this.conectarApp()
      }
      else {
        this.conexion = this.CONEXION_local
      }
      this.cargar=false
      })
      this.odootools.play('barcode_ok')
    }

  

    ionViewDidLoad() {
      
    }

    conectarApp(){

      this.cargar = true
      let message = "Conectando ..." + this.conexion.username
      this.presentToast(message)

      var odoo = new OdooConexion(this.conexion)
      var self=this
      odoo.connect(function(err, uid){
        
        if(err){
          self.odootools.play('error')
          self.presentToast("Error al acceder a odoo")
          self.conexion.logged=false
          self.conexion.uid= 0 
          self.cargar = false
          }
        if (uid){
          self.presentToast("Usuario " + self.conexion.username + " conectado")
          self.conexion.logged=true
          self.conexion.uid=uid
        }   
        self.storage.set('odoo_conexion', self.conexion).then((val)=>{
          if (val) {
            self.odootools.play('beep')
            self.navCtrl.setRoot(PickingPage)
            //self.navCtrl.setRoot(MoveFormPage, {'move_id': 14220})   
          }
          self.cargar = false
        });
        
      })
    }

    presentToast(message, duration=3, position='top') {
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
}
