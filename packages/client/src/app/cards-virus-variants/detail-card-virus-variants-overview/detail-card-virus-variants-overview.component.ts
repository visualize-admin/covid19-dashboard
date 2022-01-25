import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import {
  CovidVirusVariantsGeoEntry,
  CovidVirusVariantsGeographyDataV2,
  VirusVariantSource,
  WgsVariants,
} from '@c19/commons'
import { Observable } from 'rxjs'
import { map, mapTo, shareReplay, switchMap } from 'rxjs/operators'
import { RoutePaths } from '../../routes/route-paths.enum'
import { BaseDetailVirusVariantsCardComponent, CurrentValuesBase } from '../base-detail-virus-variants-card.component'

interface CurrentValues extends CurrentValuesBase {
  msys: CovidVirusVariantsGeoEntry
  wgs: CovidVirusVariantsGeoEntry
  variants: WgsVariants[]
}

@Component({
  selector: 'bag-detail-card-virus-variants-overview',
  templateUrl: './detail-card-virus-variants-overview.component.html',
  styleUrls: ['./detail-card-virus-variants-overview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVirusVariantsOverviewComponent extends BaseDetailVirusVariantsCardComponent<CovidVirusVariantsGeographyDataV2> {
  readonly cardDetailPath = RoutePaths.SHARE_OVERVIEW

  readonly currentValues$: Observable<CurrentValues> = this.selectedGeoUnit$.pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    map((geoUnit): CurrentValues => {
      return {
        geoUnit,
        timeSpan: this.data.timeSpan,
        msys: this.data.geoUnitData[geoUnit][VirusVariantSource.MYSYS],
        wgs: this.data.geoUnitData[geoUnit][VirusVariantSource.WGS],
        variants: this.data.variantControls.all,
      }
    }),
    shareReplay(1),
  )

  readonly description$: Observable<string> = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))
}
