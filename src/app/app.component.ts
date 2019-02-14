import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';
import { PickingListPage } from '../pages/picking-list/picking-list';
import { SoundsProvider } from '../providers/sounds/sounds'
import { ProductListPage } from '../pages/product-list/product-list'
import { StockInventoryPage } from '../pages/stock-inventory/stock-inventory';
import { StockMoveListPage } from '../pages/stock-move-list/stock-move-list';
import { StockMoveFormPage } from '../pages/stock-move-form/stock-move-form';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(private sound: SoundsProvider, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'Albaranes', component: PickingListPage },
      { title: 'Productos', component: ProductListPage },
      { title: 'Ajustes de inventario', component: StockInventoryPage },
      { title: 'Movimientos de stock', component: StockMoveListPage }
    ];
    this.sound.preload('nav', 'assets/sounds/nav.mp3')
    this.sound.preload('barcode_ok', 'assets/sounds/barcode_ok.mp3')
    this.sound.preload('barcode_error', 'assets/sounds/barcode_error.mp3')
    this.sound.preload('ok', 'assets/sounds/ok.mp3')
    this.sound.preload('error', 'assets/sounds/error.mp3')
    this.sound.preload('fatal_error', 'assets/sounds/error_1.mp3')
    this.sound.preload('press', 'assets/sounds/key_press.mp3')
    this.sound.preload('beep', 'assets/sounds/beep.mp3')
  }

  sessionDestroy() {
    let val = {borrar: true}
    this.nav.setRoot(HomePage, val)  
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
