import { HttpClientModule } from '@angular/common/http';
import { Injectable, ChangeDetectorRef } from '@angular/core';
import { ToastController, AlertController } from 'ionic-angular';
import { NativeAudio } from '@ionic-native/native-audio';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { Platform } from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { DEFAULT_PACKAGE_URL_PROVIDER } from '@angular/platform-browser-dynamic/src/compiler_factory';

/*
  Generated class for the OdooToolsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/


@Injectable()
export class OdooToolsProvider {
  
  conexion: any
  audioType: string = 'html5';
  sounds: any = [];
  voice: boolean
  matches: String[];
  isRecording = false;
  str_translate: {}

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
  

  presentAlert(title, message) {
    const alert = this.alertCtrl.create({
        title: title,
        subTitle: message,
        buttons: ['Ok']
    });
    alert.present();
  }




  constructor(private tts: TextToSpeech, private speechRecognition: SpeechRecognition, public http: HttpClientModule, public toast: ToastController, public alertCtrl: AlertController, private nativeAudio: NativeAudio, platform: Platform) {
    console.log('Hello OdooToolsProvider Provider');
    //this.conexion = new OdooConexion
    if(platform.is('cordova')){
            this.audioType = 'native';
          }
    this.speechRecognition.isRecognitionAvailable().then((available: boolean) => {
      this.voice=available;
      if (available){
        this.getPermission()
      }
    })
    this.str_translate ={ 'repite': 'repite',
                          'actualiza': 'recargar', 'recargar': 'recargar', 'actualizar': 'recargar', 'recarga': 'recargar',
                          'volver': 'volver', 'atrás': 'volver', 'vuelve': 'volver',
                          'producto': 'product', 'articulo': 'product', 
                          'lote': 'lot', 
                          'paquete': 'package', 'pack': 'package', 'pak': 'package',
                          'origen': 'location', 
                          'destino': 'location_dest',
                          'cantidad': 'product_uom_qty',
                          'cantidad hecha': 'qty_done',
                          'paquete destino': 'result_package',
                          'cambio': 'cambio', 'cambiar': 'cambio',
                          'validar': 'validar', 'hacer': 'validar',
                          'deshacer': 'no_validar', 'desvalidar': 'no_validar',
                          'ler': 'lee', 'leer': 'lee', 'lee': 'lee'}
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
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
      });
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

  get_ids(values){
    let ids = []
    for (let id in values){
      ids.push(values[id]['id'])
    }
    return ids
  }
  compute_qty_apk(from_unit, to_unit, qty, conexion){
    let self = this
    let values = {'from_unit': from_unit, 'to_unit': to_unit, 'qty': qty}
    let res={}
    conexion.execute_kw('product.uom', 'compute_qty_apk', values, function(err, values){
      if(err){
        self.presentToast("Error al acceder a odoo")
        res = {'err': true, 'error': err}
        }
      if (values){
        res = values && values[0]
      }   
      return res      
    })
  }

  search_read(conexion, model, method, params){
    let self = this
    let res={}
    conexion.execute_kw(model, method, params, function(err, values){
      if(err){
        self.presentToast("Error al acceder a odoo")
        res = {'err': true, 'error': err}
        }
      if (values){
        res = {'err': false, 'vals': values}
      }   
      return res      
    })


  }
  onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
  }

  filter_obj(values=[], object, filtered='', key='id')  {
    let res = []
    if (object=='picking.type'){key = 'id'}
    else if (object=='stock.picking'){key='state'}
    for (let val in values){
      if (values[val][key]==filtered){
        res.push(values[val])}
    }
    return res

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

  translate(field){
    if (this.str_translate[field]){
      return this.str_translate[field]
    }
    return false
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

  validar_move(move_id=0, vals={}){
    let values = {'move_id': move_id, vals: vals}
    let model = 'stock.move.line'
    let method='set_as_pda_done()'
    let res = {}
    this.conexion.execute_kw(model, method, values, function(err, values){
      if(err){
        this.toast.presentToast("Error al acceder a odoo")
        res = {'err': true, 'error': err}
        }
      if (values){
        res = {'err': false, 'vals': values}
      }   
      return res      
    })

  }
  get_lot_str(quant, type='min'){
    return quant['lot_id']['name'] + ". Qty: " + quant['qty_available'] + " " + quant['uom_id']['name'] + " en " + quant['location_id']['name']
  }
  
  get_next_move(move_id, moves, picking){
    if (picking['filter']=='P'){
      moves = moves.filter(x => x['pda_done']==true)
    }
    else if (picking['filter']=='R'){
      moves = moves.filter(x => x['pda_done']==false)
    }
    let act_move = false
    let prev_move = false
    let next_move = false
    let next_m = 0
    for (let m in moves){
        let move = moves[m]
        if (next_move)
          {continue}
        
        if (!act_move && !move_id == move['id'])
          act_move = move['id']

        if (prev_move && !next_move){
          next_move = prev_move
          let next_m = m
        }
        
        if (move_id == move['id']){
            prev_move = move_id}
    }
    let id = next_move || act_move 
    if (!id){
      return false}
    return {'next_id': id, 'next_pos': next_m}
    
    
    

  }
  
}
