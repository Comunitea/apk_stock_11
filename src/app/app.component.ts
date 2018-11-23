import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//Paginas
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';
import { PickingPage } from '../pages/picking/picking';
import { PickingFormPage } from '../pages/picking-form/picking-form';
import { OdooToolsProvider } from '../providers/odoo-tools/odoo-tools'
//Providers
import {Storage} from '@ionic/storage';
import { HttpClient } from '@angular/common/http';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;


  constructor(public odoo: OdooToolsProvider, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Login', component: LoginPage },
      { title: 'Albaranes', component: PickingPage },
      { title: 'List', component: ListPage }
    ];
    this.odoo.preload('nav', 'assets/sounds/nav.mp3')
    this.odoo.preload('barcode_ok', 'assets/sounds/barcode_ok.mp3')
    this.odoo.preload('barcode_error', 'assets/sounds/barcode_error.mp3')
    this.odoo.preload('ok', 'assets/sounds/ok.mp3')
    this.odoo.preload('error', 'assets/sounds/error.mp3')
    this.odoo.preload('fatal_error', 'assets/sounds/error_1.mp3')
    this.odoo.preload('press', 'assets/sounds/key_press.mp3')
    this.odoo.preload('beep', 'assets/sounds/beep.mp3')


  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.nav.setRoot(LoginPage);
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

}
