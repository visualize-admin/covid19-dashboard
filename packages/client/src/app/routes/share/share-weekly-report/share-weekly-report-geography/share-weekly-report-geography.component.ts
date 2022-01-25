import { ChangeDetectionStrategy, Component } from '@angular/core'
import { WeeklyReportEpidemiologicGeographyCard } from '@c19/commons'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { RouteDataKey } from '../../../route-data-key.enum'
import { ShareWeeklyReportBaseComponent } from '../share-weekly-report-base.component'

@Component({
  template: `
    <bag-weekly-report-card-geography
      [data]="data"
      [cantonGeoJson]="cantonGeoJson"
      [grGeoJson]="grGeoJson"
      [facet]="facet"
    ></bag-weekly-report-card-geography>
  `,
  styleUrls: ['../share-weekly-report-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareWeeklyReportGeographyComponent extends ShareWeeklyReportBaseComponent<WeeklyReportEpidemiologicGeographyCard> {
  readonly cantonGeoJson: ExtendedGeoFeatureCollection = this.route.snapshot.data[RouteDataKey.GEO_JSON]
  readonly grGeoJson: ExtendedGeoFeatureCollection = this.route.snapshot.data[RouteDataKey.GEO_JSON_2]
}
