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
import { ListPage } from '../pages/list/list';
import { PickingListPage } from '../pages/picking-list/picking-list';
import { PickingFormPage } from '../pages/picking-form/picking-form';
import { MoveFormPage } from '../pages/move-form/move-form'
import { MoveLineFormPage } from '../pages/move-line-form/move-line-form'

import { ScannerProvider } from '../providers/scanner/scanner';
import { SoundsProvider } from '../providers/sounds/sounds';
import { OdooProvider } from '../providers/odoo/odoo';
import { StockProvider } from '../providers/stock/stock';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    PickingListPage,
    PickingFormPage,
    MoveFormPage,
    MoveLineFormPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()    
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    PickingListPage,
    PickingFormPage,
    MoveFormPage,
    MoveLineFormPage

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

  ]
})
export class AppModule {}
