import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CantonGeoUnit, GdiObject, HospCapacityCertAdhocDevelopmentData } from '@c19/commons'
import { Observable } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'
import { QueryParams } from '../../../../shared/models/query-params.enum'
import { selectChanged } from '../../../../static-utils/select-changed.operator'
import { CapacityBaseDetailComponent } from '../capacity-base-detail.component'

@Component({
  selector: 'bag-detail-intensive',
  templateUrl: './detail-intensive.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailIntensiveComponent extends CapacityBaseDetailComponent {
  readonly gdiObject = GdiObject.HOSP_CAPACITY_ICU

  readonly certifiedBedsDevelopmentData$: Observable<HospCapacityCertAdhocDevelopmentData> =
    this.route.queryParams.pipe(
      selectChanged(QueryParams.GEO_FILTER),
      switchMap((geo: CantonGeoUnit | null) => this.dataService.loadHospCapacityCertAdhocDevelopmentData(geo)),
      shareReplay(1),
    )
}
