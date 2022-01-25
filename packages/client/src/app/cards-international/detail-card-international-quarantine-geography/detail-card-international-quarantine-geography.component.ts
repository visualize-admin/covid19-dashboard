import { isPlatformBrowser } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { InternationalQuarantineData, IntGeoUnit, isDefined } from '@c19/commons'
import { map, shareReplay, switchMap, tap } from 'rxjs/operators'
import { TranslatorService } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import {
  ChoroplethEventData,
  ChoroplethGeoFeature,
  ChoroplethGeoFeatureCollection,
} from '../../diagrams/choropleth/base-choropleth.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_NO_CASE,
  COLOR_QUARANTINE,
  COLOR_QUARANTINE_FROM,
  COLOR_QUARANTINE_TO,
  COLORS_CHOROPLETH_QUARANTINE_SCALE,
} from '../../shared/commons/colors.const'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import { WarningSeverity, WarningsItem } from '../../shared/components/warnings-list/warnings-list.component'
import { IntMapZoomFilter } from '../../shared/models/filters/int-geo-filter.enum'
import { formatUtcDate } from '../../static-utils/date-utils'
import {
  ParsedQuarantineEntry,
  ParsedQuarantineEntryEnding,
  ParsedQuarantineEntryFuture,
  ParsedQuarantineEntryOngoing,
  ParsedQuarantineEntryPast,
  ParsedQuarantineGeoData,
  parseQuarantineEntries,
  parseQuarantineEntry,
  QuarantineState,
} from '../../static-utils/quarantine-utils'
import { BaseInternationalGeographyCardComponent } from '../base-international-geography-card.component'

interface GeoTooltipQuarantine {
  title: string
  value: string
}

interface GeoMapData {
  featureCollection: ChoroplethGeoFeatureCollection<ParsedQuarantineEntry>
  geoUnit: IntGeoUnit | null
  zoomGeoUnit: string | null
  zoomMaxExtent: number | null
  quarantineToDate: Date | null
  quarantineFromDate: Date | null
}

interface CurrentValues {
  mapZoom: IntMapZoomFilter
  geoUnit: IntGeoUnit | null
  data: ParsedQuarantineGeoData
  sourceDate: Date
}

interface QuarantineItems {
  current: WarningsItem[]
  future: WarningsItem[]
  nextListUpdate: Date | null
  noLonger: WarningsItem[]
  none: WarningsItem[]
}

@Component({
  selector: 'bag-detail-card-international-quarantine-geography',
  templateUrl: './detail-card-international-quarantine-geography.component.html',
  styleUrls: ['./detail-card-international-quarantine-geography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardInternationalQuarantineGeographyComponent extends BaseInternationalGeographyCardComponent {
  @Input()
  data: InternationalQuarantineData

  readonly scaleColors = COLORS_CHOROPLETH_QUARANTINE_SCALE
  readonly countriesWithRegion = ['DE', 'FR', 'IT', 'AT']
  readonly currentValues$ = this.currentIntGeoValues$.pipe(
    map(([mapZoom, geoUnit]) => ({
      mapZoom,
      geoUnit,
      data: parseQuarantineEntries(this.data.data),
      sourceDate: new Date(this.data.sourceDate),
    })),
    shareReplay(1),
  )
  readonly choroplethData$ = this.currentValues$.pipe(
    tap(() => {
      if (!this.geoJson) {
        throw new Error('GeoJson was not provided via @Input()')
      }
    }),
    map(this.prepareGeoMapData.bind(this)),
    shareReplay(1),
  )

  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))
  readonly quarantineItems$ = this.currentValues$.pipe(map(this.prepareQuarantineItems.bind(this)))
  readonly downloadUrls$ = this.currentValues$.pipe(switchMap(this.createImageDownloadUrls.bind(this)))
  readonly detailUrl$ = this.currentValues$.pipe(map(this.createShareUrl.bind(this)))

  @ViewChild('tooltip', { static: true, read: TemplateRef })
  tooltipElRef: TemplateRef<{ title: string }>

  readonly isBrowser: boolean

  protected topic = RoutePaths.DASHBOARD_INTERNATIONAL_QUARANTINE
  protected cardType = RoutePaths.SHARE_QUARANTINE_GEOGRAPHY

  constructor(
    route: ActivatedRoute,
    router: Router,
    tooltipService: TooltipService,
    uriService: UriService,
    translator: TranslatorService,
    @Inject(PLATFORM_ID) platformId: any,
  ) {
    super(route, router, tooltipService, uriService, translator)
    this.isBrowser = isPlatformBrowser(platformId)
  }

  showTooltip({ source, unit, properties }: ChoroplethEventData<ParsedQuarantineEntry>) {
    const valueFromEntry = (item: ParsedQuarantineEntry): string => {
      if (!isDefined(item) || item.state === QuarantineState.NONE) {
        return this.translator.get('International.Quarantine.Card.NoQuarantine')
      } else {
        switch (item.state) {
          case QuarantineState.PAST:
            return this.translator.get('International.Quarantine.Card.NoLongerQuarantine', {
              end: formatUtcDate(item.end),
            })
          case QuarantineState.ONGOING:
            return this.translator.get('International.Quarantine.Card.QuarantineSince', {
              start: formatUtcDate(item.start, 'dd.MM.yyyy'),
            })
          case QuarantineState.ENDING:
            return this.translator.get('International.Quarantine.Card.QuarantineFromTo', {
              start: formatUtcDate(item.start, 'dd.MM.yyyy'),
              end: formatUtcDate(item.end, 'dd.MM.yyyy'),
            })
          case QuarantineState.FUTURE:
            return this.translator.get('International.Quarantine.Card.QuarantineFrom', {
              start: formatUtcDate(item.start, 'dd.MM.yyyy'),
            })
        }
      }
    }

    const tooltipCtx: GeoTooltipQuarantine = {
      title: this.translator.get(`CountryRegionFilter.${unit}`),
      value: valueFromEntry(properties),
    }
    this.tooltipService.showTpl(source, this.tooltipElRef, tooltipCtx, {
      position: 'above',
      offsetY: 10,
    })
  }

  readonly getFill = ({ properties }: ChoroplethGeoFeature<ParsedQuarantineEntry>): string => {
    switch (properties.state) {
      case QuarantineState.ONGOING:
        return COLOR_QUARANTINE
      case QuarantineState.ENDING:
        return COLOR_QUARANTINE_TO
      case QuarantineState.FUTURE:
        return COLOR_QUARANTINE_FROM
      default:
        return COLOR_NO_CASE
    }
  }

  private createCurrentQuarantineWarnings(items: ParsedQuarantineEntry[]): WarningsItem[] {
    return items
      .filter(
        (item): item is ParsedQuarantineEntryOngoing | ParsedQuarantineEntryEnding =>
          item.state === QuarantineState.ONGOING || item.state === QuarantineState.ENDING,
      )
      .map((item): WarningsItem => {
        const args: Record<string, string> = { start: formatUtcDate(item.start) }
        const isEnding = item.state === QuarantineState.ENDING
        if (isEnding) {
          args.end = formatUtcDate(item.end)
        }
        return {
          label: this.translator.get(`CountryRegionFilter.${item.unit}`),
          info: isEnding
            ? this.translator.get('International.Quarantine.Card.QuarantineFromTo', args)
            : this.translator.get('International.Quarantine.Card.QuarantineSince', args),
          severity: isEnding ? WarningSeverity.MED : WarningSeverity.HIGH,
          group: item.unit.substr(0, 2),
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  private createFutureQuarantineWarnings(items: ParsedQuarantineEntry[]): WarningsItem[] {
    return items
      .filter((item): item is ParsedQuarantineEntryFuture => item.state === QuarantineState.FUTURE)
      .map(({ unit }): WarningsItem => {
        return {
          label: this.translator.get(`CountryRegionFilter.${unit}`),
          severity: WarningSeverity.LOW,
          group: unit.substr(0, 2),
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  private createNoneQuarantineWarnings(items: ParsedQuarantineEntry[]): WarningsItem[] {
    return items
      .filter((item) => item.state === QuarantineState.NONE)
      .map(({ unit }): WarningsItem => {
        return {
          label: this.translator.get(`CountryRegionFilter.${unit}`),
          info: this.translator.get('International.Quarantine.Card.NoQuarantine'),
          severity: WarningSeverity.ZERO,
          group: unit.substr(0, 2),
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  private createNoLongerQuarantineWarnings(items: ParsedQuarantineEntry[]): WarningsItem[] {
    return items
      .filter((item): item is ParsedQuarantineEntryPast => item.state === QuarantineState.PAST)
      .map(({ unit, end }): WarningsItem => {
        const args = { end: formatUtcDate(end) }
        return {
          label: this.translator.get(`CountryRegionFilter.${unit}`),
          info: this.translator.get('International.Quarantine.Card.NoLongerQuarantine', args),
          severity: WarningSeverity.ZERO,
          group: unit.substr(0, 2),
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  private prepareGeoMapData({ data, mapZoom, geoUnit }: CurrentValues): GeoMapData {
    const entries = Object.entries(data).reduce(
      (u, [key, val]) => u.set(key, val),
      new Map<string, ParsedQuarantineEntry>(),
    )

    const augmentedData: ChoroplethGeoFeature<ParsedQuarantineEntry>[] = this.geoJson.features.map((geoJsonFeature) => {
      const unit: IntGeoUnit = <any>geoJsonFeature.id.toString()
      const properties = entries.get(unit) || { state: QuarantineState.NONE, unit }
      return { ...geoJsonFeature, properties, unit }
    })

    const zoomOptions = this.getZoomOptions(geoUnit, mapZoom)

    return {
      featureCollection: { ...this.geoJson, features: augmentedData },
      geoUnit,
      ...zoomOptions,
      quarantineFromDate:
        Object.values(data).find((item): item is ParsedQuarantineEntryFuture => item.state === QuarantineState.FUTURE)
          ?.start || null,
      quarantineToDate:
        Object.values(data).find((item): item is ParsedQuarantineEntryEnding => item.state === QuarantineState.ENDING)
          ?.end || null,
    }
  }

  private createDescription({ sourceDate, geoUnit }: CurrentValues): string {
    return [
      this.translator.get(geoUnit ? `CountryRegionFilter.${geoUnit}` : 'Commons.World'),
      this.translator.get(`International.Quarantine.Card.DataStatus`, {
        date: formatUtcDate(sourceDate),
      }),
    ].join(', ')
  }

  private prepareQuarantineItems({ data, geoUnit }: CurrentValues): QuarantineItems {
    const items = geoUnit ? Object.values(data).filter(({ unit }) => unit.startsWith(geoUnit)) : Object.values(data)
    const nextListUpdate =
      items.find((item): item is ParsedQuarantineEntryFuture => item.state === QuarantineState.FUTURE)?.start || null

    return {
      nextListUpdate,
      current: this.createCurrentQuarantineWarnings(items),
      future: this.createFutureQuarantineWarnings(items),
      noLonger: geoUnit ? this.createNoLongerQuarantineWarnings(items) : [],
      none: geoUnit
        ? this.createNoneQuarantineWarnings([data[geoUnit] || parseQuarantineEntry(geoUnit, undefined)])
        : [],
    }
  }

  protected override createImageDownloadUrls() {
    const isoDate = formatUtcDate(new Date(), 'yyyy-MM-dd')
    const pathPart = `${RoutePaths.DASHBOARD_INTERNATIONAL}/${this.topic}`
    const url = this.uriService.createDetailUrl(pathPart, this.cardType, true, { forDate: isoDate })
    return this.uriService.getImageDownloadDefinitions(url, 'international_quarantine', 'geography')
  }
}
