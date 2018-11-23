import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { NativeAudio } from '@ionic-native/native-audio';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';
import { PickingFormPage } from '../pages/picking-form/picking-form';
import { PickingPage } from '../pages/picking/picking';
import { MoveFormPage } from '../pages/move-form/move-form'
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpClientModule} from '@angular/common/http';

import { TextToSpeech } from '@ionic-native/text-to-speech';
//Providers
import { IonicStorageModule } from '@ionic/storage'


import { OdooToolsProvider } from '../providers/odoo-tools/odoo-tools';
import { OdooScannerProvider } from '../providers/odoo-scanner/odoo-scanner';
import { OdooConnectorProvider } from '../providers/odoo-connector/odoo-connector';
import { OdooStockPickingProvider } from '../providers/odoo-stock-picking/odoo-stock-picking';

import { BottomBadgeComponent} from '../components/bottom-badge/bottom-badge'
import { MoveLineComponent} from '../components/move-line/move-line'
import { IconPickStateComponent} from '../components/icon-pick-state/icon-pick-state'
import { MatIconModule } from "@angular/material/icon";
import { IonMarqueeModule } from "ionic-marquee";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    PickingPage,
    ListPage,
    LoginPage,
    PickingFormPage,
    MoveFormPage,
    BottomBadgeComponent,
    MoveLineComponent,
    IconPickStateComponent,
    

  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    MatIconModule,
    IonMarqueeModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    PickingPage,
    PickingFormPage,
    MoveFormPage,
    BottomBadgeComponent,
    MoveLineComponent,
    IconPickStateComponent

  ],
  providers: [
    StatusBar,
    SplashScreen,
    SpeechRecognition,
    TextToSpeech,
    NativeAudio,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    OdooToolsProvider,
    HttpClientModule,
    OdooScannerProvider,
    OdooConnectorProvider,
    OdooStockPickingProvider,


  ]
})
export class AppModule {}
