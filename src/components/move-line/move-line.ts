import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
/**
 * Generated class for the MoveLineComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
import {OdooToolsProvider} from '../../providers/odoo-tools/odoo-tools'
 import { MoveFormPage } from '../../pages/move-form/move-form'


export interface Picking{
  id : number;
  user_id;
  state: string;
  name: string;
  scheduled_date: string
  filter: string;
}

export interface Move {
  id : number
  user_id
  product_id;
  move_id;
  location_id;
  location_dest_id;
  pda_done : boolean;
  pda_checked: boolean;
  qty_done;
  product_uom_qty;
  lot_id;
  package_id;
  result_package_id;
  product_uom_id;
  product_uos_id;
  index: number;
  state: string;
  
}

@Component({
  selector: 'move-line',
  templateUrl: 'move-line.html'
})
export class MoveLineComponent {

  text: string;
  process_from_tree: true;


  @Input() move: Move
  @Input() picking: Picking
  @Input() filter: String
  @Input() back_color

  @Output() notify: EventEmitter <Boolean> = new EventEmitter<Boolean>();

  constructor(private navCtrl:NavController, public odootools: OdooToolsProvider) {
    console.log('Hello MoveLineComponent Component');
    this.text = 'Hello World';
  }

  move_done(do_id: Boolean){
    this.notify.emit(do_id)
  }
  open_move(move_id){

    let val =  {'move_id': move_id, 'object': this.move['object'], 'picking': this.picking}
    this.navCtrl.setRoot(MoveFormPage, val)
  }
  open_package(package_id){

  }
  open_lot(lot_id){

  }
  get_op_ready(){}
  
  click(value){
    let c = this.move['checked']
    if (value=='product_id'){
      this.open_move(this.move['id'])
      //c.product_id = !c.product_id
    }
    else if (value=='package_id'){
      c.package_id = !c.package_id
      if (c.package_id){c.product_id = c.package_id}
      c.location_id= c.package_id
      c.lot_id = c.package_id
    }
    else if (value=='lot_id'){
      c.lot_id = !c.lot_id
      c.product_id= c.lot_id
    }
    else if (value=='location_id'){
      c.location_id= !c.location_id
    }
    else if (value=='location_dest_id'){
      c.location_dest_id= !c.location_dest_id
    }
    else if (value=='result_package_id'){
      c.result_package_id = !c.result_package_id
      c.location_dest_id=  c.result_package_id
    }
    else if (value=='product_qty'){
      c.package_qty = !c.package_qty
    }

  }


  inputUomQty(){
    this.inputQty(this['product_uom_id']['name'], this['product_uom_qty'], this['qty_done'], false, 'Cantidades')
  }
  inputUosQty(){
    this.inputQty(this['uos_id']['name'], this['uos_qty'], this.convert_uom_to_uos(this.move['qty_done']), true, 'Cantidades')
  }
  inputQty(uom_name, ordered_qty, qty_done, uos=false, title ="Qty") {
    this.odootools.presentAlert
    if (this.move['pda_done']){return}
    
    var self = this;
    
    let alert = this.odootools.alertCtrl.create({
      title: title,
      message: uom_name,
      inputs: [
        {
          name: 'qty',
          placeholder: qty_done.toString()
        },
       
      
      ],
      buttons: [
        {
          text:'Qty Ok',
          handler:(data)=>{
            this.get_uom_uos_qtys(uos, ordered_qty)
          }
        },
      
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.qty<0){
              self.odootools.presentAlert('Error!', 'La cantidad debe ser mayor que 0');
            }
            else if (data.qty) {
              this.get_uom_uos_qtys(uos, data.qty)
            }
            
            
          }
        }
      ]
    });

    
    alert.present();
  }

  get_uom_uos_qtys(uos, qty: number){
    if (uos){
      this.move['qty_done'] =  this.convert_uos_to_uom(qty);
      this.move['uos_qty_done'] = qty;
    }
    else {

      this.move['qty_done'] = qty;
      this.move['uos_qty_done'] = this.convert_uom_to_uos(qty);
    }
    this.get_op_ready()
  }

  
   // Valorar traer el número de decimales de la unidad de Odoo
  convert_uom_to_uos(qty){
    return (qty/this.move['uom_to_uos']).toFixed(this.move['uos_id']['rounding'])
  }
  convert_uos_to_uom(qty){
    return (qty*this.move['uom_to_uos']).toFixed(this.move['product_uom_id']['rounding'])
  }
  convert_to_fix(qty){
    return (qty*1).toFixed(2)
  }
  set_as_pda_done(pda_done){
    let vals={'pda_done': pda_done, 'qty_done': pda_done && this.move['qty_done'] || 0.00}
    let res = this.odootools.validar_move(this.move.id, vals)




  }
}
