import { Component, Input } from '@angular/core';

/**
 * Generated class for the StaticMoveComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'static-move',
  templateUrl: 'static-move.html'
})
export class StaticMoveComponent {

  another_move_data: {};
  @Input('move_data') move_data : {};

  constructor() {
    
  }

  ngOnInit(){
    console.log(this.move_data);
    this.another_move_data = this.move_data;
    console.log(this.another_move_data);
  }

}
