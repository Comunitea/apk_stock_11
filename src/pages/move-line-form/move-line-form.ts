import { Component, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Events } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { PickingFormPage } from '../picking-form/picking-form';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HostListener } from '@angular/core';
import { ScannerProvider } from '../../providers/scanner/scanner'
import { SoundsProvider } from '../../providers/sounds/sounds'
import { WarehouseFormPage } from '../warehouse-form/warehouse-form';

/**
 * Generated class for the MoveLineFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-move-line-form',
  templateUrl: 'move-line-form.html',
})
export class MoveLineFormPage {
  @ViewChild('scan') myScan ;

  model: any
  id: any
  move_data: {}
  authForm: any
  index: any
  picking_ids: any
  promiseDone: boolean
  ScanReader: FormGroup
  hide_scan_form: boolean
  index_lines: any
  lines_ids: any
  max_ids: number
  last_read: any
  location_barcode: boolean
  product_barcode: boolean
  original_location_barcode: boolean
  picking_type: any
  new_origin_location_barcode: any
  new_origin_location_id: any
  new_location_id: any
  new_location_barcode: any
  change_location: boolean
  package_origin: boolean
  package_origin_confirm: boolean
  package_dest: boolean
  step: any
  new_origin_location_name: any
  new_location_name: any
  new_product_lot_id: any
  new_product_lot_name: any
  new_product_package_id: any
  new_product_package_name: any
  new_product_max_qty: any
  new_product_qt: any
  new_package: any
  product_qty_confirmed: any
  pkg_error: any
  location_error: any
  product_error: any
  qty_error: any
  location_dest_error: any
  repeat_read: boolean
  new_location: any
  arrow_movement: boolean
  product_need_check: boolean
  input_error: boolean
  confirmation_code: any

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.scanner.key_press(event)
    this.scanner.timeout.then((val)=>{
      this.changeDetectorRef.detectChanges()
      switch(val) {
        case "left": {
          if(this.arrow_movement == true) {
            this.open_line(-1)
            break
          }
        }

        case "right": {
          if(this.arrow_movement == true) {
            this.open_line(1)
            break
          }
        }

        case "down": {
          if(this.arrow_movement == true) {
            this.backToPickingForm(true, 0)
            break
          }
        }

        case "up": {
          if(this.arrow_movement == true) {
            this.backToPickingForm(true, 0)
            break
          }
        }

        default: {
          this.scan_read(val)
          break
        }
      }
      
    })
  }

  constructor(private changeDetectorRef: ChangeDetectorRef, public events: Events, private zone: NgZone, public navCtrl: NavController, public navParams: NavParams, private stockInfo: StockProvider, public alertCtrl: AlertController, public fb: FormBuilder, public scanner: ScannerProvider, private sound: SoundsProvider, public formBuilder: FormBuilder ) {
    this.ScanReader = this.formBuilder.group({scan: ['']});
    this.model = Number(this.navParams.data.model)
    this.id = this.navParams.data.id
    this.get_move_data(this.id)
    this.index = this.navParams.data.index
    this.picking_ids = this.navParams.data.picking_ids
    this.scanner.on()
    this.index_lines = this.navParams.data.index_lines
    this.lines_ids = this.navParams.data.lines_ids
    this.max_ids = this.navParams.data.lines_ids.length
    this.confirmation_code = this.navParams.data.confirmation_code
    this.location_barcode = false
    this.product_barcode = false
    this.product_need_check = false
    this.original_location_barcode = false
    this.picking_type = this.navParams.data.picking_type
    this.change_location = false
    this.package_dest = true
    this.package_origin = true
    this.package_origin_confirm = false
    this.product_qty_confirmed = false
    this.pkg_error = false
    this.location_error = false
    this.product_error = false
    this.qty_error = false
    this.location_dest_error = false
    this.step = 0
    this.arrow_movement = true
    this.input_error = false
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MoveLineFormPage');
    this.changeDetectorRef.detectChanges()
  }

  open_line(index_lines: number = 0){
    /* Utilizando esta función para paginar las líneas se lleva información de una página a otra.
       Necesitamos ponerlas por defecto para que los datos se calculen bien. */
    this.index_lines = this.index_lines + Number(index_lines)
    if (this.index_lines >= this.max_ids){this.index_lines=0}
    if (this.index_lines < 0 ){this.index_lines=this.max_ids-1}
    this.id = this.navParams.data.lines_ids[this.index_lines]['id']
    this.location_barcode = false
    this.product_barcode = false
    this.product_barcode = false
    this.original_location_barcode = false
    this.new_origin_location_barcode = false
    this.new_origin_location_name = false
    this.new_origin_location_id = false
    this.change_location = false
    this.step = 0
    this.last_read = false
    this.new_location_id = false
    this.new_location_barcode = false
    this.package_origin_confirm = false
    this.package_dest = true
    this.package_origin = true
    this.new_location_name = false
    this.new_product_lot_id = false
    this.new_product_lot_name = false
    this.new_product_package_id = false
    this.new_product_package_name = false
    this.new_product_max_qty = false
    this.new_product_qt = false
    this.new_package = false
    this.product_qty_confirmed = false
    this.pkg_error = false
    this.location_error = false
    this.product_error = false
    this.qty_error = false
    this.location_dest_error = false
    this.product_need_check = false
    this.input_error = false
    this.confirmation_code = false
    this.get_move_data(this.navParams.data.lines_ids[this.index_lines]['id'])
    this.sound.play('nav')
    this.changeDetectorRef.detectChanges();
  }

  get_move_data(id) {

    this.stockInfo.get_component_info(id, 'stock.move.line').then((lines:Array<{}>)=> {
      this.move_data = lines
      console.log(lines)
      
      this.changeDetectorRef.detectChanges();

      /* Dependiendo del tipo de transferencia ponemos a true los datos que no necesitamos comprobar. */

      switch (this.picking_type) {
        case 'incoming': {
          this.original_location_barcode = true
          this.step = 1   
          this.changeDetectorRef.detectChanges();     
          break;
        }
        case 'outgoing': {
          this.location_barcode = true
          this.changeDetectorRef.detectChanges();
          break;
        }
        default: {
          break;
        }
      }

      if(this.move_data['product_need_check']) {
        this.product_need_check = true
        this.changeDetectorRef.detectChanges();
      }

      if(!this.move_data['need_check']) {
        this.original_location_barcode = true
        this.step = 1
        this.changeDetectorRef.detectChanges();
      }

      if(!this.move_data['need_dest_check']) {
        this.location_barcode = true
        this.changeDetectorRef.detectChanges();
      }

      if(!this.move_data['package_id']){
        this.package_origin = false
        this.changeDetectorRef.detectChanges();
      } 

      if(!this.move_data['result_package_id']){
        this.package_dest = false
        this.changeDetectorRef.detectChanges();
      }

      if(this.move_data['qty_done'] > 0 && this.location_barcode == true){
        this.step = 4
        this.product_barcode = true
        this.product_qty_confirmed = true
        this.changeDetectorRef.detectChanges();
      } else if (this.move_data['qty_done'] > 0) {
        this.product_barcode = true
        this.product_qty_confirmed = true
        this.step = 3
        this.changeDetectorRef.detectChanges();
      }

      this.check_on_start()
      var cont = 0
      this.navParams.data.lines_ids.forEach(x => {
        x.index = cont
        cont++
      })

    })
    .catch((mierror) => {
      this.move_data = []
      this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar el pick')
      this.changeDetectorRef.detectChanges();
    })

    return
  }

  scan_read(val){
    console.log(val)
    console.log(this.step)
    if (this.last_read==val){
      this.repeat_read = true
    }
    else {
      this.repeat_read = false
      this.last_read = val
    }

    switch (this.step) {
      case 0: {
        this.location_error = false
        this.pkg_error = false

        /* Primero comprobamos si lo que se ha introducido coincide con algún lote/paquete/producto de nuestra lista
        que no sea el movimiento actual */
        if(this.move_data['package_id'][0] != val) {
          this.check_if_code_is_in_line_ids(val)
        }

        /* Si se ha introducido un nuevo origen: */
        if(this.new_origin_location_id) {
          if (val == this.new_origin_location_barcode) {
            /* Si confirma el nuevo origen */
            this.move_data['location_id'][0] = this.new_origin_location_id
            this.move_data['location_id'][1] = this.new_origin_location_name
            this.move_data['barcode'] = this.new_origin_location_barcode
            /* Cambiamos los valores de paquete y lote del nuevo origen. */
            if (this.new_product_lot_id && this.new_product_lot_name) {
              this.move_data['lot_id'] = {
                '0': this.new_product_lot_id,
                '1': this.new_product_lot_name
              }
            }
            if (this.new_product_package_id && this.new_product_package_name) {
              this.move_data['package_id'] = {
                '0': this.new_product_package_id,
                '1': this.new_product_package_name
              }
            }
            this.original_location_barcode = true
            this.new_origin_location_id = false
            this.step = 1
            break;
          }
        }

        if(this.package_origin && !this.package_origin_confirm) {
          /* Si existe un paquete y se ha iniciado el proceso de confirmación comprobamos si valor es el nombre del paquete */
          if (val == this.move_data['package_id'][1]) {
            /* Enviamos el proceso al paso 3, ya que el paquete verifica el origen, lote y cantidad */
            this.package_origin_confirm = true
            this.original_location_barcode = true
            this.product_barcode == true
            this.move_data['qty_done'] = this.move_data['ordered_qty']
            if(this.location_barcode == true ) {
              this.step = 4
            } else {
              this.step = 3
            }
            this.changeDetectorRef.detectChanges();
          } else {
            this.pkg_error = true
          }
        } else if(!this.package_origin && !this.original_location_barcode) {
          /* Se comprueba si existe un código de localización que coincida con el introducido. */
          this.stockInfo.check_if_location_barcode(val).then((lines:Array<{}>) => {
            if(lines.length > 0) {
              /* Comprobamos que el código sea el que figura en el albarán. */
              var name_line = lines[0]['location_id'][1] + '/' + lines[0]['name']
              this.check_original_location_barcode(lines[0]['barcode'], lines[0]['id'], name_line)
            } else {
              this.location_error = true
            }
          })
        }
        break;
      }

      case 1: {
        this.product_error = false

        /* En caso de que el campo need_check del origen no esté marcado buscamos el producto en el listado */
        
        if(!this.move_data['need_check']) {
          this.check_if_code_is_in_line_ids(val)
        }

        this.check_product_code(val, 1)
        break;
      }

      case 2: {
        this.qty_error = false
        /* Si hemos indicado una cantidad nueva comprobamos que la confirma correctamente. */
        if(this.new_product_qt) {
          if(val == this.new_product_qt) {
            this.step = 3
            this.product_qty_confirmed = true
            this.move_data['qty_done'] = val
            this.new_product_qt = false
            this.check_if_end_of_line()
          } else {
            /* Si la cantidad no se valida reseteamos el valor */ 
            this.qty_error = true
            this.new_product_qt = false
          }
        } else {
          this.check_product_code(val, 2)
        }
        break;
      }

      case 3: {
        this.location_dest_error = false
        /* Comprobamos códigos a verificar o que no necesiten un doble check */
        if(this.location_barcode) {
          this.step = 4
          this.changeDetectorRef.detectChanges()
          break;
        } else {
          this.check_location_barcode(val)
        }         

        /* Si se ha iniciado un cambio de destino comprobamos que se verifica el código correctamente. */
        if(this.change_location) {
          if (val == this.new_location['barcode']) {
            this.move_data['location_dest_id'] = {
              0: this.new_location['id'],
              1: this.new_location['location_name']
            }
            this.move_data['barcode_dest'] = this.new_location['barcode']
            this.location_barcode = true
            this.change_location = false
            this.step = 5
            this.input_confirm()
            break;
          } else {
            this.location_dest_error = true
          }
        }  
        break;    
      }

      case 4: {
        if(this.repeat_read) {
          this.step = 5
          this.input_confirm()
        }
      }
    }
  }

  manual_qty_done(){
    const prompt = this.alertCtrl.create({
      title: 'Nueva cantidad',
      message: 'Introduce una nueva cantidad',
      inputs: [
        {
          name: 'Cantidad'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cambio cancelado')
          }
        },
        {
          text: 'OK',
          handler: data => {
            this.new_product_qt = data['Cantidad']
            this.scan_read(data['Cantidad'])
          }
        }
    ]
    });
    prompt.present();
  }

  check_if_code_is_in_line_ids(val) {
    var filtered_lines = this.navParams.data.lines_ids.filter(x => (val.includes(x.lot_id[1]) || val.includes(x.lot_name)
     || val.includes(x.package_id[1]) || val.includes(x.default_code) || val.includes(x.product_barcode)) && x.id != this.id)

    if(filtered_lines.length>0) {
      let data = {'model': this.model, 'id': filtered_lines[0]['id'], 'index': this.navParams.data.index, 'picking_ids': this.navParams.data.picking_ids, 'index_lines': filtered_lines[0]['index'],
     'lines_ids': this.lines_ids, 'picking_type': this.navParams.data.picking_type, 'confirmation_code': val}
      this.navCtrl.setRoot(MoveLineFormPage, data)
    }
     
  }

  check_on_start() {
    /* Si no es un paquete y no requiere check entonces pasa al siguiente paso. */
    if(this.step == 0 && !this.package_origin && this.original_location_barcode) {
      this.step = 1
      this.changeDetectorRef.detectChanges()
    }
    
    /* Si venimos de leer un código en otro movimiento o desde el albarán, nos situamos en el paso correcto y leemos ese código. */
    if(this.confirmation_code) {
      this.scan_read(this.confirmation_code)
      this.changeDetectorRef.detectChanges()
    }
  }

  manual_confirm() {
    this.step = 5
    this.input_confirm()
  }

  check_product_code(val, step) {

    if(this.move_data['lot_id'] == false) {
      /* Si no existe comprueba el lot_name (los incoming no tienen lot_id). */
      if(this.move_data['lot_name'] == val) {
        this.product_barcode = true
        /* Si estamos en el paso 2 (comprobando cantidades) cambiamos el mensaje y actualizamos la cantidad hecha. */
        this.check_step(this.step)
        this.step = Number(step) + 1
        this.check_if_end_of_line()
        this.changeDetectorRef.detectChanges()
      } else {
        /* Si no existe comprueba el código de barras. */
        if(val == this.move_data['product_barcode'] || val == this.move_data['default_code']) {
          this.product_barcode = true
          this.check_step(this.step)
          this.step = Number(step) + 1
          this.check_if_end_of_line()
          this.changeDetectorRef.detectChanges()
        } else {
          /* Si no existe comprobamos en qué paso estamos. Si estamos en el paso 2 es que ha introducido una cantidad, la verificamos. */
          if (this.step == 2) {
            this.new_qt_check(val)
          } else {
            this.product_error = true
          }
          this.changeDetectorRef.detectChanges()
          }

      }
    } else {
      /* Si tiene lot_id verifica que sea el mismo */
      if(val == this.move_data['lot_id'][1]) {
        this.product_barcode = true
        this.check_step(this.step)
        this.step = Number(step) + 1
        this.check_if_end_of_line()
        this.changeDetectorRef.detectChanges()
      } else {
        if (this.step == 2) {
          /* Comprobamos que la cantidad sea correcta. */
          this.new_qt_check(val)
        } else {
          this.product_error = true
        }
        this.changeDetectorRef.detectChanges()
      }
    }

  }

  check_step(step) {
    if(step == 2) {
      this.move_data['qty_done'] = this.move_data['ordered_qty']
      this.product_qty_confirmed = true
    } 
  }

  check_if_end_of_line() {
    if(this.location_barcode && this.product_qty_confirmed){
      this.step = 4
    }
  }

  new_qt_check(val) {
    if(Number(val)) {
      /* Si no existe una cantidad máxima es que no se ha modificado el origen, por lo tanto la cantidad máxima será la del albarán. */
      if(!this.new_product_max_qty) {
        /* Revisar si se usa product_qty o product_uom_qty */
        this.new_product_max_qty = this.move_data['ordered_qty']
      }
      /* Comprobamos que el valor no sea mayor que la cantidad máxima que podemos mover de ese producto. */
      if(val <= this.new_product_max_qty) {
        this.new_product_qt = val
      } else {
        this.qty_error = true
      }
    } else {
      this.qty_error = true
    }
  }

  save_new_package(value) {
    this.new_package = value
    this.changeDetectorRef.detectChanges()
  }

  check_location_barcode(barcode) {
    /* Comprueba el barcode de destino.
       Si no son iguales comprueba que el nuevo se corresponda con alguna ubicación, si es así inicia el proceso de cambio de ubicación. */
    if(barcode == this.move_data['barcode_dest']) {
      this.location_barcode = true
      this.step = 5
      this.input_confirm()
    } else {
      this.stockInfo.check_if_location_barcode(barcode).then((lines:Array<{}>) => {
        if(lines.length > 0) {
          this.new_location = {
            'id': lines[0]['id'],
            'barcode': barcode,
            'location_name': lines[0]['location_id'][1] + '/' + lines[0]['name']
          }
          this.change_location = true
          this.changeDetectorRef.detectChanges()
        }
      })
    }    
  }

  check_original_location_barcode(barcode, id, name) {
    /* Comprueba que el código introducido sea el del origen */
    if(barcode == this.move_data['barcode']) {
      this.original_location_barcode = true
      this.step = 1
    } else {
      /* Buscar alternativa */
      this.stockInfo.get_quants_pda(id, this.move_data).then((lines:Array<{}>) => {
        if(!lines[0]) {
          this.location_error = true
        } else {
          /* Guardamos los datos para la verificación. */
          if(lines[0]['lot_id']['id'] && lines[0]['lot_id']['name']) {
            this.new_product_lot_id = lines[0]['lot_id']['id']
            this.new_product_lot_name = lines[0]['lot_id']['name']
          }
          if(lines[0]['package_id']['id'] && lines[0]['package_id']['name']) {
            this.new_product_package_id = lines[0]['package_id']['id']
            this.new_product_package_name = lines[0]['package_id']['name']
          }
          this.new_product_max_qty = lines[0]['qty']
          this.new_origin_location_barcode = barcode
          this.new_origin_location_id = id
          this.new_origin_location_name = name
        }
      })
    }
    this.changeDetectorRef.detectChanges()
  }

  check_if_location_dest_is_needed(id) {
    /* Comprueba si está marcado el check, si no lo está entonces el flag de location se pone a true */
    this.stockInfo.check_if_need_dest_check(id).then((lines:Array<{}>) => {
      if(!lines[0]['need_dest_check']) {
        this.location_to_true(0)
      }
    })
  }

  check_if_original_location_is_needed(id) {
    /* Comprueba si está marcado el check, si no lo está entonces el flag de original location se pone a true */
    this.stockInfo.check_if_need_check(id).then((lines:Array<{}>) => {
      if(!lines[0]['need_check']) {
        this.location_to_true(1)
      }
    })
  }

  location_to_true(type) {
    if(type == 0) {
      this.location_barcode = true
    } else if (type == 1) {
      this.original_location_barcode = true
    }
  }

  input_confirm(){
    this.changeDetectorRef.detectChanges()
    /* Si se ha indicado que hay que introducir los productos en un nuevo paquete lo creamos. */  
    if(this.new_package) {
      var name = 'PQT' + this.id
      this.changeDetectorRef.detectChanges()
      this.stockInfo.create_new_package('stock.quant.package', name).then((lineas:Array<{}>) => {
        this.move_data['result_package_id'] = {
          '0': lineas,
          '1': name 
        }
        this.update_move_line()
      }).catch((err) => {
        console.log(err)
    });
    } else {
      this.update_move_line()
    }

  }

  update_move_line() {
    this.input_error = false

    /* En las entradas de mercancía no existe un lot_id pero tenemos que indicar igualmente el nombre del lote. */
    if(this.picking_type == 'incoming') {
      this.move_data['lot_id'] = {
        '0': false,
        '1': this.move_data['lot_name']
      }
      this.changeDetectorRef.detectChanges()
    }
    this.stockInfo.picking_line_to_done('stock.move.line', this.id, this.move_data).then((lines:Array<{}>) => {
      let next_line = this.index_lines + 1
      if(next_line >= this.max_ids) {
        this.backToPickingForm(lines, this.move_data['ordered_qty'])
      } else {
        this.nextPickingFormLine(lines, this.move_data['ordered_qty'], next_line)
      }
    }).catch((err) => {
        console.log(err)
        this.input_error = true
    });
  }

  submitScan(value: any):void {
    /* El submit para las pruebas sin pistola. */
    if(value.scan) {
      this.scan_read(value.scan)
    }
    this.changeDetectorRef.detectChanges()
  }

  toggle_scan_form() {
    this.hide_scan_form = !this.hide_scan_form
    this.arrow_movement = !this.arrow_movement
    this.changeDetectorRef.detectChanges()
  }

  backToPickingForm(promiseDone, qty_done) {
    /* Volvemos al formulario. */
    if(promiseDone) {
      let val = {'index': this.navParams.data.index, 'picking_ids': this.navParams.data.picking_ids}
      this.navCtrl.setRoot(PickingFormPage, val)
      this.changeDetectorRef.detectChanges()
    } else {
      this.stockInfo.errorAlert('stock.move.line', this.id, qty_done);
      this.changeDetectorRef.detectChanges()
    }
  }

  nextPickingFormLine(promiseDone, qty_done, next_line) {
    /* Pasamos a la siguiente línea del formulario. */
    var next_line = next_line
    if(promiseDone) {
      let val = {'model': this.model, 'id': this.navParams.data.lines_ids[next_line]['id'], 'index': this.navParams.data.index, 'picking_ids': this.navParams.data.picking_ids, 'index_lines': next_line, 'lines_ids': this.lines_ids, 'picking_type': this.navParams.data.picking_type, 'confirmation_code': false}
      this.navCtrl.setRoot(MoveLineFormPage, val)
      this.changeDetectorRef.detectChanges()
    } else {
      this.stockInfo.errorAlert('stock.move.line', this.id, qty_done);
    }
  }

  checkWarehouse(warehouse_id, next_line) {
    var self = this
    var next_line = next_line
    var warehouse_id = warehouse_id
    let index_mapa = {'warehouse_id': warehouse_id, 'model': this.model, 'id': this.navParams.data.lines_ids[next_line]['id'], 'index': this.navParams.data.index, 'picking_ids': this.navParams.data.picking_ids, 'index_lines': next_line, 'lines_ids': this.lines_ids, 'picking_type': this.navParams.data.picking_type}

    this.navCtrl.setRoot(WarehouseFormPage, index_mapa)
  }

  qty_done_to_zero(){
    var line_to_update = []
    line_to_update.push({
      'id': this.id,
      'qty_done': 0
    })
    this.stockInfo.update_qty_lines(line_to_update).then((value) => {
      this.open_line(0)
      this.changeDetectorRef.detectChanges()
    }).catch((err) => {
      console.log(err)
    });
  }

  previous_step() {
    this.step = this.step -1    
    if(this.step == 0) {
      this.open_line(0)
    } else if(this.step == 1) {
      this.product_barcode = false
      this.product_qty_confirmed = false
    } else if(this.step == 2) {
      this.product_qty_confirmed = false
      this.new_product_qt = false
    } else if(this.step == 3) {
      /* if(this.picking_type == 'outgoing' || !this.move_data['need_dest_check']) {
        this.location_barcode = true
        this.step = 4
      } else {
        this.location_barcode = false
      }  */
      this.location_barcode = false
      this.change_location = false
    }
    this.changeDetectorRef.detectChanges()
  }

}
