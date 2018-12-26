//import { HttpClient } from '@angular/common/http';
import { Platform } from 'ionic-angular';
import { Injectable,  ApplicationRef} from '@angular/core';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { NativeAudio } from '@ionic-native/native-audio';
/*
  Generated class for the SoundsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SoundsProvider {
  conexion: any
  audioType: string = 'html5';
  sounds: any = [];
  voice: boolean
  matches: String[];
  isRecording = false;
  str_translate: {}
  
  constructor(platform: Platform, private ref: ApplicationRef, private tts: TextToSpeech, private speechRecognition: SpeechRecognition, private nativeAudio: NativeAudio) {
    console.log('Hello SoundsProvider Provider');
    if(platform.is('cordova')){
      this.audioType = 'native';
    }
    this.speechRecognition.isRecognitionAvailable().then((available: boolean) => {
    this.voice=available;
    if (available){
      this.getPermission()
    }
    })
  }
  lee(mensaje=''){
    
    this.tts.speak({
      text: mensaje,
      locale: 'es-ES',
      rate: 2
  }).then(
      (msg) => { console.log(msg); },
      (err) => { console.log(err); }
    );
  }
  stopListening() {
    if (!this.voice){return}
    this.speechRecognition.stopListening().then(() => {
      this.isRecording = false;
    });
  }
  
  getPermission() {
    if (!this.voice){return}
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
      });
  }
 
  recon_voice(matches){
    this.matches = matches
    this.ref.tick();
    for (let m in matches){
      if (this.recon_order(matches[m]))
      {return}
    }
  }
  recon_order(match) {
  
    if (match.indexOf('atras')!=-1){      
      return 'back'
    }
    else if (match.indexOf('lote')!=-1){
      return 'lot'
      
    }
    else if (match.indexOf('paquete')!=-1){
      return 'pack'
    }
    else if (match.indexOf('origen')!=-1){
      return 'from'
    }
    else if (match.indexOf('cantidad')!=-1){
      return 'qty'
    }
    else if (match.indexOf('destino')!=-1){
      return 'to'
    }
    else if (match.indexOf('validar')!=-1){
      return 'action_done'
    }
  return false
}

startListening() {
    if (!this.voice){return}
    let options = {
      language: 'es-ES',
      matches: 3,
      showPopup: false,
      showPartial: true
    }
    this.speechRecognition.startListening(options).subscribe(matches => {
      this.matches = matches;
      //this.cd.detectChanges();
    });
    this.isRecording = true;
  }
  preload(key, asset) {
 
        if(this.audioType === 'html5'){
 
            let audio = {
                key: key,
                asset: asset,
                type: 'html5'
            };
 
            this.sounds.push(audio);
 
        } else {
 
            this.nativeAudio.preloadSimple(key, asset);
             let audio = {
                key: key,
                asset: key,
                type: 'native'
            };
             this.sounds.push(audio);
        }      
 
    }
  play(key){
      let audio = this.sounds.find((sound) => {
          return sound.key === key;
      });
      if(audio.type === 'html5'){
          let audioAsset = new Audio(audio.asset);
          audioAsset.play();
      } else {
          this.nativeAudio.play(audio.asset).then((res) => {
              console.log(res);
          }, (err) => {
              console.log(err);
          });
      }
  }
  str_form (type='', object){
    let str=''
    if (type=='move'){
      str = 'Orden:  objectr ' + object['product_uom_qty'] + " " + object['product_uom_id']['name'] + ' de ' + object['product_id']['name']
      if (object['package_id']) {str = str + '  y Paquete: ' + object['package_id']['name']}
      if (object['lot_id']) {str = str + '  y Lote: ' + object['lot_id']['name']}
      str = str + '  Desde ' + object['location_id']['name']
      str = str + '  a ' + object['location_dest_id']['name']
      if (object['package_dest_id']) {str = str + ' o al Paquete : ' + object['package_dest_id']['name']}
    }
    else if (type='package'){
      str = 'Paquete: ' + object['name']
      if (object['qty']){str =str + '  con ' + object['quant_quantity']  + " " + object['uom_id']['name']
      if (object['product_id']){str =str + '  de ' + object['product_id']['name']}
      if (object['lot_id']) {str = str + '  y lote: ' + object['lot_id']['name']}
      if (object['location_id']){str =str + '  situado en: ' + object['location_id']['name']}
    }

    return str
    }
  }
}
