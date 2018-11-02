import { Component, Input} from '@angular/core';

/**
 * Generated class for the IconPickStateComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'icon-pick-state',
  templateUrl: 'icon-pick-state.html'
})
export class IconPickStateComponent {

  @Input() state: string

  state_icon
  STATE_ICONS={
    'cancel':'trash', 
    'error': 'alert', 
    'done': 'checkmark-circle', 
    'waiting': 'clock', 
    'confirmed': 'checkmark',
    'assigned': 'done-all', 
    'draft': 'close-circle'}
 
  constructor() {
    this.state_icon = this.STATE_ICONS[this.state]
    
  }

}
