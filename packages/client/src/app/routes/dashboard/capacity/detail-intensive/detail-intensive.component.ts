import { ChangeDetectionStrategy, Component } from '@angular/core'
import { GdiObject } from '@c19/commons'
import { CapacityBaseDetailComponent } from '../capacity-base-detail.component'

@Component({
  selector: 'bag-detail-intensive',
  templateUrl: './detail-intensive.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailIntensiveComponent extends CapacityBaseDetailComponent {
  readonly gdiObject = GdiObject.HOSP_CAPACITY_ICU
}
