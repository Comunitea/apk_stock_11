import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule} from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import { MyApp } from './app.component';
import { NativeAudio } from '@ionic-native/native-audio';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';

import { HomePage } from '../pages/home/home';
import { PickingListPage } from '../pages/picking-list/picking-list';
import { PickingFormPage } from '../pages/picking-form/picking-form';
import { NewPickingFormPage } from '../pages/new-picking-form/new-picking-form';
import { MoveFormPage } from '../pages/move-form/move-form'
import { MoveLineFormPage } from '../pages/move-line-form/move-line-form'
import { ProductListPage } from '../pages/product-list/product-list';
import { ProductFormPage } from '../pages/product-form/product-form';
import { LotFormPage } from '../pages/lot-form/lot-form';
import { StockInventoryPage } from '../pages/stock-inventory/stock-inventory';
import { StockInventoryFormPage } from '../pages/stock-inventory-form/stock-inventory-form';
import { StockInventoryCreatePage } from '../pages/stock-inventory-create/stock-inventory-create';
import { StockInventoryFormLinePage } from '../pages/stock-inventory-form-line/stock-inventory-form-line';
import { StockInventoryFormNewLinePage } from '../pages/stock-inventory-form-new-line/stock-inventory-form-new-line';
import { StockMoveListPage } from '../pages/stock-move-list/stock-move-list';
import { StockMoveFormPage } from '../pages/stock-move-form/stock-move-form';

import { ScannerProvider } from '../providers/scanner/scanner';
import { ProductProvider } from '../providers/products/products';
import { SoundsProvider } from '../providers/sounds/sounds';
import { OdooProvider } from '../providers/odoo/odoo';
import { StockProvider } from '../providers/stock/stock';



@NgModule({
  declarations: [
    MyApp,
    HomePage,
    PickingListPage,
    PickingFormPage,
    NewPickingFormPage,
    MoveFormPage,
    MoveLineFormPage,
    ProductListPage,
    ProductFormPage,
    LotFormPage,
    StockInventoryPage,
    StockInventoryFormPage,
    StockInventoryCreatePage,
    StockInventoryFormLinePage,
    StockInventoryFormNewLinePage,
    StockMoveListPage,
    StockMoveFormPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
    /* Para Android ~9 hay que poner poner websql para que funcione.
    
    IonicStorageModule.forRoot(
      {
        name: '__mydb',
        driverOrder: ['sqlite', 'websql', 'indexeddb']
        }
    ) 
     Si se activa siempre no funciona en navegadores de incógnito.
    */
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    PickingListPage,
    PickingFormPage,
    NewPickingFormPage,
    MoveFormPage,
    MoveLineFormPage,
    ProductListPage,
    ProductFormPage,
    LotFormPage,
    StockInventoryPage,
    StockInventoryFormPage,
    StockInventoryCreatePage,
    StockInventoryFormLinePage,
    StockInventoryFormNewLinePage,
    StockMoveListPage,
    StockMoveFormPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    OdooProvider,
    StockProvider,
    ScannerProvider,
    SoundsProvider,
    SpeechRecognition,
    TextToSpeech,
    NativeAudio,
    ProductProvider
  ]
})
export class AppModule {}
