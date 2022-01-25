import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import {
  GdiObject,
  InternationalComparisonDetailGeoData,
  InternationComparisonDailyValues,
  IntGeoUnit,
  Iso2Country,
} from '@c19/commons'
import { Observable } from 'rxjs'
import { map, shareReplay, switchMap, tap } from 'rxjs/operators'
import {
  ChoroplethEventData,
  ChoroplethGeoFeature,
  ChoroplethGeoFeatureCollection,
} from '../../diagrams/choropleth/base-choropleth.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_NO_CASE,
  COLOR_RANGE_1,
  COLOR_RANGE_2,
  COLOR_RANGE_3,
  COLOR_RANGE_4,
  COLORS_CHOROPLETH_SCALE,
} from '../../shared/commons/colors.const'
import { D3SvgComponent } from '../../shared/components/d3-svg/d3-svg.component'
import {
  TooltipTableContentComponent,
  TooltipTableContentData,
} from '../../shared/components/tooltip/tooltip-table-content/tooltip-table-content.component'
import { IntMapZoomFilter } from '../../shared/models/filters/int-geo-filter.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { BaseInternationalGeographyCardComponent, ZoomOptions } from '../base-international-geography-card.component'

interface CurrentValues {
  mapZoom: IntMapZoomFilter
  geoUnitFilter: IntGeoUnit | null
  geoUnit: IntGeoUnit
  sourceDate: Date
  data: InternationalComparisonDetailGeoData
}

interface GeoMapData extends ZoomOptions {
  withNoData: boolean
  withNoCase: boolean
  featureCollection: ChoroplethGeoFeatureCollection<InternationComparisonDailyValues>
  geoUnitFilter: IntGeoUnit | null
  currentGeoUnit: IntGeoUnit
  currentGeoUnitData: InternationComparisonDailyValues
  dataCH: InternationComparisonDailyValues
}

@Component({
  selector: 'bag-detail-card-international-case-geography',
  templateUrl: './detail-card-international-case-geography.component.html',
  styleUrls: ['./detail-card-international-case-geography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardInternationalCaseGeographyComponent extends BaseInternationalGeographyCardComponent {
  @Input()
  data: InternationalComparisonDetailGeoData

  readonly scaleColors = COLORS_CHOROPLETH_SCALE
  readonly countriesWithRegion = ['DE', 'FR', 'IT', 'AT']
  readonly currentValues$: Observable<CurrentValues> = this.currentIntGeoValues$.pipe(
    map(([mapZoom, geoUnitFilter]) => ({
      mapZoom,
      geoUnitFilter,
      geoUnit: geoUnitFilter || 'WORLD',
      data: this.data,
      sourceDate: new Date(this.data.sourceDate),
    })),
  )
  readonly geoMapData$: Observable<GeoMapData> = this.currentValues$.pipe(
    tap(() => {
      if (!this.geoJson) {
        throw new Error('GeoJson was not provided via @Input()')
      }
    }),
    map(this.prepareGeoMapData.bind(this)),
    shareReplay(1),
  )
  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))
  readonly downloadUrls$ = this.currentValues$.pipe(switchMap(this.createImageDownloadUrls.bind(this)))
  readonly detailUrl$ = this.currentValues$.pipe(map(this.createShareUrl.bind(this)))

  protected topic = RoutePaths.DASHBOARD_INTERNATIONAL_CASE
  protected cardType = RoutePaths.SHARE_GEOGRAPHY

  showTooltip(
    { source, unit, properties }: ChoroplethEventData<InternationComparisonDailyValues>,
    dataCH: InternationComparisonDailyValues,
  ) {
    const titleKey = `CountryRegionFilter.${unit}`

    const ctx: TooltipTableContentData = {
      title: this.translator.get(titleKey),
      col1Key: titleKey,
      col1LabelHidden: true,
      col1Bold: true,
      col2Key: 'CountryRegionFilter.CH',
      col2Bold: true,
      entries: !properties
        ? null
        : [
            {
              key: 'Commons.Cases.Inz100K.Abbr',
              col1: { value: adminFormatNum(properties.CovidCase.inzRollsum14d) },
              col2: { value: adminFormatNum(dataCH.CovidCase.inzRollsum14d) },
            },
            {
              key: 'Commons.Cases',
              col1: { value: adminFormatNum(properties.CovidCase.rollsum14d) },
              col2: { value: adminFormatNum(dataCH.CovidCase.rollsum14d) },
            },
          ],
      col2Hidden: unit === Iso2Country.CH,
    }

    this.tooltipService.showCmp(TooltipTableContentComponent, source, ctx, { position: 'above', offsetY: 10 })
  }

  override mapZoomedOrMoved(zoomedOrMoved: boolean) {
    if (zoomedOrMoved) {
      this.mapZoomFilterCtrl.setValue(null)
    }
  }

  readonly getFill = (
    { properties, unit }: ChoroplethGeoFeature<InternationComparisonDailyValues>,
    instance: D3SvgComponent,
  ): string => {
    const value = properties?.CovidCase?.inzRollsum14d ?? null
    if (this.countriesWithRegion.includes(unit)) {
      return 'none'
    }
    switch (value) {
      case 0:
        return COLOR_NO_CASE
      case null:
        return instance.noDataFill
      default:
        return value < 60 ? COLOR_RANGE_1 : value < 120 ? COLOR_RANGE_2 : value < 240 ? COLOR_RANGE_3 : COLOR_RANGE_4
    }
  }

  private prepareGeoMapData({ geoUnit, geoUnitFilter, mapZoom, data }: CurrentValues): GeoMapData {
    const augmentedData: ChoroplethGeoFeature<InternationComparisonDailyValues>[] = this.geoJson.features.map(
      (geoJsonFeature) => {
        const unit = geoJsonFeature.id.toString()
        return { ...geoJsonFeature, properties: data.geoData[unit], unit }
      },
    )
    const zoomOptions = this.getZoomOptions(geoUnitFilter, mapZoom)

    const allValues = Object.values(data.geoData)

    return {
      withNoData: augmentedData.some((d) => !d.properties),
      withNoCase: allValues.some((v) => v[GdiObject.CASE].inzRollsum14d === 0),
      featureCollection: { ...this.geoJson, features: augmentedData },
      geoUnitFilter,
      currentGeoUnit: geoUnit,
      currentGeoUnitData: data.geoData[geoUnit],
      dataCH: data.geoData[Iso2Country.CH],
      ...zoomOptions,
    }
  }

  private prepareDescription({ geoUnit, data }: CurrentValues): string {
    const [date1, date2] = [data.timeSpan.start, data.timeSpan.end].map((dStr) => formatUtcDate(parseIsoDate(dStr)))
    return [
      this.translator.get('International.Cases.Card.DescriptionTitle'),
      this.translator.get(geoUnit === 'WORLD' ? 'Commons.World' : 'CountryRegionFilter.' + geoUnit),
      this.translator.get('Commons.DateToDate', { date1, date2 }),
      this.translator.get('Commons.Inz100K'),
    ].join(', ')
  }
}
