import { Component } from '@angular/core';
import {Storage} from '@ionic/storage';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public toast: ToastController, public navCtrl: NavController) {

  }
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

}
