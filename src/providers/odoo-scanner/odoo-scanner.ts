import { Injectable } from '@angular/core';
import { OdooToolsProvider } from '../odoo-tools/odoo-tools'
import { HostListener } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';


@Injectable()
export class OdooScannerProvider {
    
  
    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
     
      }
    code = ""
    timeStamp  = 0
    timeout = null
    state = false
    is_order = false
    constructor(private odootools: OdooToolsProvider) {
        this.reset_scan()
    }
    reset_scan(){
        this.code = ""
        this.is_order = false
        this.timeStamp = 0
        this.timeout = null
    }
    on(){
        this.state=true
        this.reset_scan()
        //this.odootools.presentToast(this.code)
    }
    off(){
        this.state=false
        this.reset_scan()
        //this.odootools.presentToast(this.code)
    }

    key_press(event){
        let st = ("Me llega " + event.which + '[' + event.key + ' ]' + " y tengo " + this.code)
        //this.odootools.presentToast(st)
        
        //this.odootools.presentToast(e)
        if(!this.state){ //ignore returns

        }
        else{
            //este 250 es el tiempo en resetear sin pulsaciones
            if (this.timeStamp + 400 < new Date().getTime()){
                this.code = ""
                this.is_order = false
            }
            this.timeStamp = new Date().getTime();
            //this.odootools.presentToast(st)
            
            clearTimeout(this.timeout);
            
            if (event.which > 111 && event.which < 121 ) {
                this.code = event.key
                this.is_order = true
            }
            else if (event.which >= 48 && event.which < 110) {
                this.is_order = false
                this.code += event.key;
            }
            
            
            this.timeout = new Promise ((resolve) => {
                setTimeout(()=>{
                    if(this.code && (this.code.length >= 4 || this.is_order)){
                    this.is_order = false
                    //console.log('Devuelvo ' + this.code)
                    let scan = this.code.replace('-','/')
                    this.code = ''
                    //console.log (scan + " ----> " + this.code)
                    resolve(scan);
                };
                },100);
                // este 500 es el tiempo que suma pulsaciones
            })
        }
        return this && this.timeout
    }
 
}
