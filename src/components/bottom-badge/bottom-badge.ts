import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';

/**
 * Generated class for the BottomBadgeComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'bottom-badge',
  templateUrl: 'bottom-badge.html'
})
export class BottomBadgeComponent {

  text: string;
  @Input() btext: String
  @Input() bvalue: Number
  @Input() btype: String
  @Input() BDest
  @Input() BDestVal: {}


  //@Output() notify: EventEmitter <Boolean> = new EventEmitter<Boolean>();

  constructor() {
   
  }
 
}
