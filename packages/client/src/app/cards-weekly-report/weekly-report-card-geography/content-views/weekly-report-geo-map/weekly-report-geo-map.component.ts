import { ChangeDetectionStrategy, Component, forwardRef, Inject, ViewEncapsulation } from '@angular/core'
import { CantonGeoUnitNumber, GeoUnit, isDefined, WeeklyReportEpidemiologicGeographyCard } from '@c19/commons'
import { scaleQuantize } from 'd3'
import { getISOWeek } from 'date-fns'
import { Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { TranslatorService } from '../../../../core/i18n/translator.service'
import {
  ChoroplethEventData,
  ChoroplethGeoFeature,
  ChoroplethGeoFeatureCollection,
  ExtendedGeoFeatureCollection,
} from '../../../../diagrams/choropleth/base-choropleth.component'
import { createColorScale } from '../../../../diagrams/utils'
import { COLOR_NO_CASE, COLORS_CHOROPLETH_SCALE } from '../../../../shared/commons/colors.const'
import { D3SvgComponent } from '../../../../shared/components/d3-svg/d3-svg.component'
import {
  TooltipListContentComponent,
  TooltipListContentData,
} from '../../../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { TooltipService } from '../../../../shared/components/tooltip/tooltip.service'
import { RegionsFilter } from '../../../../shared/models/filters/regions-filter.enum'
import { adminFormatNum } from '../../../../static-utils/admin-format-num.function'
import { formatUtcDate } from '../../../../static-utils/date-utils'
import { CurrentWrGeoValues, WeeklyReportCardGeographyComponent } from '../../weekly-report-card-geography.component'

interface GeoDataProps {
  inz: number | null
  abs: number | null
  diff: number | null
}

interface PerWeekData {
  date: Date
  geoData: ChoroplethGeoFeatureCollection<GeoDataProps>
}

interface ViewData {
  prevWeek: PerWeekData
  currWeek: PerWeekData
  fillFn: (feature: ChoroplethGeoFeature<GeoDataProps>, instance: D3SvgComponent) => string
  min: number
  max: number
  hasNullValues: boolean
}

@Component({
  selector: 'bag-weekly-report-geo-map',
  templateUrl: './weekly-report-geo-map.component.html',
  styleUrls: ['./weekly-report-geo-map.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportGeoMapComponent {
  viewData$: Observable<ViewData> = this.parent.currentValues$.pipe(
    map(this.prepareViewData.bind(this)),
    shareReplay(1),
  )

  readonly scaleColors = COLORS_CHOROPLETH_SCALE

  constructor(
    protected tooltipService: TooltipService,
    protected translator: TranslatorService,
    @Inject(forwardRef(() => WeeklyReportCardGeographyComponent)) readonly parent: WeeklyReportCardGeographyComponent,
  ) {}

  showTooltip({ source, unit, properties }: ChoroplethEventData<GeoDataProps>, date: Date) {
    const withDiff = properties.diff !== null
    const ctx: TooltipListContentData = {
      title: this.translator.get(`GeoFilter.${unit}`),
      date: this.translator.get('WeeklyReport.WeekFrom', { week: getISOWeek(date), date: formatUtcDate(date) }),
      noData: !(isDefined(properties.inz) && isDefined(properties.abs)),
      entries: [
        {
          label: this.translator.get('Commons.Inz100K.Abbr'),
          value: adminFormatNum(properties.inz, 2),
        },
        {
          label: this.translator.get('Commons.AbsoluteNumbers'),
          value: adminFormatNum(properties.abs),
          borderBelow: withDiff,
        },
      ],
    }
    if (withDiff) {
      ctx.entries?.push({
        label: this.translator.get('WeeklyReport.DifferenceToPreviousWeek'),
        value: adminFormatNum(properties.diff, 1, '%', true),
      })
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, { position: 'above', offsetY: 10 })
  }

  hideTooltip() {
    this.tooltipService.hide()
  }

  private prepareViewData(cv: CurrentWrGeoValues): ViewData {
    const forCantons = cv.regionsFilter === RegionsFilter.CANTONS
    const geoJson = forCantons ? this.parent.cantonGeoJson : this.parent.grGeoJson
    const featuresW1 = this.prepareFeatures(geoJson, cv.prevWeek, false)
    const featuresW2 = this.prepareFeatures(geoJson, cv.currWeek, true)

    const mapValues = [...featuresW1, ...featuresW2].map((f) => f.properties.inz)
    const nonNullOrZeroValues = mapValues.filter(isDefined).filter((v) => v !== 0)

    const min = nonNullOrZeroValues.length ? Math.min(...nonNullOrZeroValues) : 0
    // add zero in case all data are null Math.max() returns Infinity
    const max = Math.max(0, ...nonNullOrZeroValues)

    const colorScale = scaleQuantize<string>().domain([min, max]).range(createColorScale(this.scaleColors, 6))
    const fillFn = ({ properties }: ChoroplethGeoFeature<GeoDataProps>, instance: D3SvgComponent): string => {
      switch (properties.inz) {
        case 0:
          return COLOR_NO_CASE
        case null:
          return instance.noDataFill
        default:
          return <string>colorScale(properties.inz)
      }
    }

    return {
      prevWeek: {
        date: cv.prevWeekStart,
        geoData: { ...geoJson, features: featuresW1 },
      },
      currWeek: {
        date: cv.currWeekStart,
        geoData: { ...geoJson, features: featuresW2 },
      },
      min,
      max,
      fillFn,
      hasNullValues: mapValues.some((v) => v === null),
    }
  }

  private prepareFeatures(
    geoJson: ExtendedGeoFeatureCollection,
    data: WeeklyReportEpidemiologicGeographyCard,
    withDiff: boolean,
  ): Array<ChoroplethGeoFeature<GeoDataProps>> {
    return geoJson.features.map((geoJsonFeature) => {
      let unit: GeoUnit = <any>CantonGeoUnitNumber[<number>geoJsonFeature.id] // reverse enum usage
      unit = unit || <GeoUnit>geoJsonFeature.id.toString()
      const properties: GeoDataProps = {
        inz: data.geoUnitData[unit].inzWeek,
        abs: data.geoUnitData[unit].week,
        diff: withDiff ? data.geoUnitData[unit].diffWeekPercentage : null,
      }
      return {
        ...geoJsonFeature,
        unit,
        properties,
      }
    })
  }
}
