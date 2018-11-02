import { NgModule } from '@angular/core';
import { BottomBadgeComponent } from './bottom-badge/bottom-badge';
import { MoveLineComponent } from './move-line/move-line';
import { IconPickStateComponent } from './icon-pick-state/icon-pick-state';
@NgModule({
	declarations: [BottomBadgeComponent,
    MoveLineComponent,
    IconPickStateComponent],
	imports: [],
	exports: [BottomBadgeComponent,
    MoveLineComponent,
    IconPickStateComponent]
})
export class ComponentsModule {}
