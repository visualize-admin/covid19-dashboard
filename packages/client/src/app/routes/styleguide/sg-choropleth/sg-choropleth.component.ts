import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { CantonGeoUnitNumber } from '@c19/commons'
import { getEnumKeyFromValue } from '@shiftcode/utilities'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { FillFn } from '../../../diagrams/choropleth/choropleth.component'
import { HeatmapRowEntry } from '../../../diagrams/heatmap-row/heatmap-row.component'
import { COLORS_INZ_SUM_CAT } from '../../../shared/commons/colors.const'
import { D3SvgComponent } from '../../../shared/components/d3-svg/d3-svg.component'
import { TooltipService } from '../../../shared/components/tooltip/tooltip.service'
import { formatUtcDate, parseIsoDate } from '../../../static-utils/date-utils'
import { RouteDataKey } from '../../route-data-key.enum'
import { SgChoroplethData } from './sg-choropleth-data.resolver'
import { SgChoroplethGeoJson } from './sg-choropleth-geojson.resolver'

interface GeoMapData {
  featureCollection: any
  fillFn: (feature: any, instance: D3SvgComponent) => string
  dataCount: number
  featureCount: number
  noDataCount: number
  uniqueBuckets: string[]
  noDataDeliveredCount: number
  featuresNotPresentInData: Array<{ unit: string; name: string }>
  dataNotPresentFeatures: string[]
  startDate: Date | null
  endDate: Date | null
}

interface GeoProperties {
  name: string
  max: number | null
  min: number | null
  category: string
  start: Date | null
  end: Date | null
}

interface PeriodData {
  date: Date
  data: GeoMapData
}

interface PeriodPaginatorOption {
  date: Date
  label: string
  title: string
}

@Component({
  selector: 'bag-sg-components',
  templateUrl: './sg-choropleth.component.html',
  styleUrls: ['./sg-choropleth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SgChoroplethComponent {
  get paginatorOptions(): PeriodPaginatorOption[] {
    return this.periodData.map((period, index) => {
      return {
        label: period.data.endDate
          ? `${formatUtcDate(period.data.startDate || new Date())} - ${formatUtcDate(period.data.endDate)}`
          : formatUtcDate(period.data.startDate || new Date()),
        title: this.translator.get(
          period.data.endDate ? 'DetailCardGeoRegions.Paginator.Period' : 'DetailCardGeoRegions.Paginator.Daily',
        ),
        date: period.date,
        index,
      }
    })
  }

  get periodData(): PeriodData[] {
    switch (this.mapCtrl.value) {
      case 'M':
        return this.mapDataMunicipalityPeriods
      case 'D':
        return this.mapDataDistrictsPeriods
      case 'AMRE':
        return this.mapDataAmrePeriods
      case 'AMGR':
        return this.mapDataAmgrPeriods
      case 'GR':
        return this.mapDataGreaterRegionsPeriods
      case 'C':
        return this.mapDataCantonsPeriods
      default:
        return []
    }
  }

  get heatMapData(): HeatmapRowEntry[] {
    switch (this.mapCtrl.value) {
      case 'M':
        return this.heatmapRowMunicipalData
      case 'D':
        return this.heatmapRowDistrictData
      case 'AMRE':
        return this.heatmapRowAmreData
      case 'AMGR':
        return this.heatmapRowAmgrData
      case 'GR':
        return this.heatmapRowGrRegData
      case 'C':
        return this.heatmapRowCantonData
      default:
        return []
    }
  }

  readonly scaleColors = ['#C0D8F0', '#8FBAE4', '#5C9BD9', '#3979B8', '#265382', '#112E4A']
  categories = [
    {
      label: '0-59',
      color: COLORS_INZ_SUM_CAT[0],
    },
    {
      label: '60-119',
      color: COLORS_INZ_SUM_CAT[1],
    },
    {
      label: '120-239',
      color: COLORS_INZ_SUM_CAT[2],
    },
    {
      label: '240-479',
      color: COLORS_INZ_SUM_CAT[3],
    },
    {
      label: '480-959',
      color: COLORS_INZ_SUM_CAT[4],
    },
    {
      label: '960-1919',
      color: COLORS_INZ_SUM_CAT[5],
    },
    {
      label: '1920+',
      color: COLORS_INZ_SUM_CAT[6],
    },
  ]
  countriesWithRegion = ['DE', 'FR', 'IT', 'AT']
  readonly mapCtrl = new FormControl('C')
  readonly geoUnitCtrl = new FormControl(null)
  readonly periodSliderCtrl = new FormControl(0)
  readonly paginatorCtrl = new FormControl(0)

  readonly data: SgChoroplethData = this.route.snapshot.data[RouteDataKey.DETAIL_DATA]
  readonly geoJson: SgChoroplethGeoJson = this.route.snapshot.data[RouteDataKey.GEO_JSON]

  mapDataWorld: { data: any; featureCollection: any } = {
    data: {},
    featureCollection: {
      ...this.geoJson.world,
      features: this.geoJson.world.features.map((geoJsonFeature: any) => {
        const unit = geoJsonFeature.id
        const name = this.translator.get(`CountryRegionFilter.${geoJsonFeature.id}`)
        return { ...geoJsonFeature, unit, properties: { name } }
      }),
    },
  }

  heatmapRowCantonData: HeatmapRowEntry[] = Object.entries(this.data.canton).map(([date, data]: [string, any]) => {
    return {
      date: new Date(date),
      color: this.categoryFillFn(data['VD'].normalized.cat),
    }
  })

  heatmapRowGrRegData: HeatmapRowEntry[] = Object.entries(this.data.greaterRegion).map(
    ([date, data]: [string, any]) => {
      return {
        date: new Date(date),
        color: this.categoryFillFn(data['1'].normalized.cat),
      }
    },
  )

  heatmapRowAmgrData: HeatmapRowEntry[] = Object.entries(this.data.amgr).map(([date, data]: [string, any]) => {
    return {
      date: new Date(date),
      color: this.categoryFillFn(data['1'].normalized.cat),
    }
  })
  heatmapRowAmreData: HeatmapRowEntry[] = Object.entries(this.data.amre).map(([date, data]: [string, any]) => {
    return {
      date: new Date(date),
      color: this.categoryFillFn(data['1011'].normalized.cat),
    }
  })
  heatmapRowDistrictData: HeatmapRowEntry[] = Object.entries(this.data.district).map(([date, data]: [string, any]) => {
    return {
      date: new Date(date),
      color: this.categoryFillFn(data['101'].normalized.cat),
    }
  })
  heatmapRowMunicipalData: HeatmapRowEntry[] = Object.entries(this.data.municipality).map(
    ([date, data]: [string, any]) => {
      return {
        date: new Date(date),
        color: this.categoryFillFn(data['1'].normalized.cat),
      }
    },
  )

  mapDataCantonsPeriods: Array<PeriodData> = this.preparePeriodData(this.data.canton, this.geoJson.canton, true)
  mapDataGreaterRegionsPeriods: Array<PeriodData> = this.preparePeriodData(
    this.data.greaterRegion,
    this.geoJson.greaterRegion,
  )
  mapDataMunicipalityPeriods: Array<PeriodData> = this.preparePeriodData(
    this.data.municipality,
    this.geoJson.municipality,
  )
  mapDataDistrictsPeriods: Array<PeriodData> = this.preparePeriodData(this.data.district, this.geoJson.district)
  mapDataAmrePeriods: Array<PeriodData> = this.preparePeriodData(this.data.amre, this.geoJson.amre)
  mapDataAmgrPeriods: Array<PeriodData> = this.preparePeriodData(this.data.amgr, this.geoJson.amgr)

  currentPeriodData: PeriodData

  @ViewChild('tooltip', { static: true, read: TemplateRef })
  tooltipElRef: TemplateRef<{ title: string }>

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly tooltipService: TooltipService,
    protected readonly translator: TranslatorService,
  ) {
    this.currentPeriodData = this.periodData[0]
    this.paginatorCtrl.setValue(this.paginatorOptions.find((p) => p.date === this.currentPeriodData.date))
    this.periodSliderCtrl.valueChanges.subscribe((v: number) => {
      const data = this.periodData[v]
      this.currentPeriodData = data
      this.paginatorCtrl.setValue(this.paginatorOptions.find((p) => p.date === data.date))
    })

    this.mapCtrl.valueChanges.subscribe((v: any) => {
      this.currentPeriodData = this.periodData[0]
      this.paginatorCtrl.setValue(this.paginatorOptions.find((p) => p.date === this.currentPeriodData.date))
      this.periodSliderCtrl.setValue(0)
    })
  }

  sliderTitle(data: GeoMapData): string {
    if (data.startDate && data.endDate) {
      return `${formatUtcDate(data.startDate)} - ${formatUtcDate(data.endDate)} `
    } else if (data.startDate) {
      return `${formatUtcDate(data.startDate)}`
    }
    return 'no date'
  }

  readonly getFill: FillFn = () => `hsl(210, 60%, ${30 + Math.floor(Math.random() * 6) * 3}%)`
  readonly getMask: FillFn = ({ unit, properties }, i) =>
    ['US', 'BR', 'MR', 'HR', 'DE1', 'FRI'].includes(unit) ? i.inaccurateDataMask : null

  categoryFillFn(category: string): string {
    switch (category) {
      case '0-59':
        return COLORS_INZ_SUM_CAT[0]
      case '60-119':
        return COLORS_INZ_SUM_CAT[1]
      case '120-239':
        return COLORS_INZ_SUM_CAT[2]
      case '240-479':
        return COLORS_INZ_SUM_CAT[3]
      case '480-959':
        return COLORS_INZ_SUM_CAT[4]
      case '960-1919':
        return COLORS_INZ_SUM_CAT[5]
      case '1920+':
        return COLORS_INZ_SUM_CAT[6]
      case null:
        return 'pink'
      default:
        return 'black'
    }
  }

  readonly canvasFillFn = (unit: { properties: GeoProperties }): string => this.categoryFillFn(unit.properties.category)

  paginatorNext() {
    this.paginatorCtrl.setValue(this.paginatorOptions[this.paginatorCtrl.value.index + 1])
    const indexOf = this.periodData.findIndex((p) => p.date === this.paginatorCtrl.value.date)
    this.periodSliderCtrl.setValue(indexOf > -1 ? indexOf : 0)
  }

  paginatorPrev() {
    this.paginatorCtrl.setValue(this.paginatorOptions[this.paginatorCtrl.value.index - 1])
    const indexOf = this.periodData.findIndex((p) => p.date === this.paginatorCtrl.value.date)
    this.periodSliderCtrl.setValue(indexOf > -1 ? indexOf : 0)
  }

  showTooltip(data: { source: any; unit: string; properties: GeoProperties }) {
    const tooltipCtx: {
      title: string
      id?: string
      max: number | null
      min: number | null
      category: string | null
      start: Date | null
      end: Date | null
    } = {
      id: data.unit,
      title: data.properties && data.properties.name ? data.properties.name : data.unit,
      max: data.properties && data.properties.max ? data.properties.max : null,
      min: data.properties && data.properties.min ? data.properties.min : null,
      category: data.properties && data.properties.category ? data.properties.category : null,
      start: data.properties.start,
      end: data.properties.end,
    }
    this.tooltipService.showTpl(data.source, this.tooltipElRef, tooltipCtx, {
      position: 'above',
      offsetY: 10,
    })
  }

  hideTooltip() {
    this.tooltipService.hide()
  }

  findSelectedPeriodData(periodData: PeriodData[]): PeriodData {
    const found = periodData[this.periodSliderCtrl.value]
    if (found) {
      return found
    } else {
      this.periodSliderCtrl.setValue(0)
      return periodData[0]
    }
  }

  private preparePeriodData(data: any, geoJson: any, isCanton?: boolean): Array<PeriodData> {
    const test: Array<PeriodData> = Object.entries(data)
      .map(([key, entry]: [string, any]): PeriodData => {
        return {
          date: parseIsoDate(key),
          data: this.prepareMapData(entry, geoJson, isCanton),
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
    this.periodSliderCtrl.setValue(0)
    return test
  }

  private prepareMapData(data: any, geoJson: any, isCanton?: boolean): GeoMapData {
    const nonNullOrZeroValues = Object.values(data).map((entry: any) => entry.normalized.min)

    const buckets = new Set<string>()
    Object.values(data)
      .filter((entry: any) => entry.normalized.min !== null)
      .sort((a: any, b: any) => a.normalized.min - b.normalized.min)
      .forEach((entry: any) => buckets.add(entry.normalized.cat))
    const uniqueBuckets = Array.from(buckets.values())

    const fillFn = (unit: { properties: GeoProperties }, instance: D3SvgComponent): string => {
      switch (unit.properties.category) {
        case '0-59':
          return COLORS_INZ_SUM_CAT[0]
        case '60-119':
          return COLORS_INZ_SUM_CAT[1]
        case '120-239':
          return COLORS_INZ_SUM_CAT[2]
        case '240-479':
          return COLORS_INZ_SUM_CAT[3]
        case '480-959':
          return COLORS_INZ_SUM_CAT[4]
        case '960-1919':
          return COLORS_INZ_SUM_CAT[5]
        case '1920+':
          return COLORS_INZ_SUM_CAT[6]
        case null:
          return instance.noDataFill
        default:
          return instance.noDataFill
      }
    }

    const features = geoJson.features.map((geoJsonFeature: any) => {
      const unit = isCanton
        ? getEnumKeyFromValue(CantonGeoUnitNumber, parseInt(geoJsonFeature.id, 10)) || geoJsonFeature.id
        : parseInt(geoJsonFeature.id, 10).toString(10)
      const name = geoJsonFeature.name
      const minVal = data[unit] ? data[unit].normalized.min : null
      const maxVal = data[unit] ? data[unit].normalized.max : null
      const category = data[unit] ? data[unit].normalized.cat : null
      const start = data[unit] ? parseIsoDate(data[unit].startDate) : null
      const end = data[unit] && data[unit].endDate ? parseIsoDate(data[unit].endDate) : null
      return { ...geoJsonFeature, unit, properties: { name, min: minVal, max: maxVal, category, start, end } }
    })

    const featuresNotPresentInData: Array<{ unit: string; name: string }> = []
    geoJson.features.forEach((geoJsonFeature: any) => {
      const unit = parseInt(geoJsonFeature.id, 10).toString(10)
      if (!data[unit]) {
        featuresNotPresentInData.push({ unit: geoJsonFeature.id, name: geoJsonFeature.name })
      }
    })

    const units: string[] = features.map((f: any) => f.unit)

    const dataNotPresentFeatures: string[] = []
    Object.keys(data).forEach((key) => {
      if (!units.includes(key)) {
        dataNotPresentFeatures.push(key)
      }
    })

    const dataCount = nonNullOrZeroValues.length
    const featureCount = geoJson.features.length

    const noDataCount = features.filter((f: any) => f.properties.min === null).length
    const noDataDeliveredCount = nonNullOrZeroValues.filter((v) => v === null).length

    return {
      dataNotPresentFeatures,
      featuresNotPresentInData,
      noDataDeliveredCount,
      uniqueBuckets,
      noDataCount,
      dataCount,
      featureCount,
      fillFn,
      featureCollection: {
        ...geoJson,
        features,
      },
      startDate: features[0].properties.start,
      endDate: features[0].properties.end,
    }
  }
}
