import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID, OnDestroy } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CantonGeoUnit,
  GdiObject,
  HospCapacityGeoValuesRecord,
  isDefined,
  Language,
  TopLevelGeoUnit,
} from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { forkJoin, Observable, Subject } from 'rxjs'
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators'
import { DataService } from '../../../core/data/data.service'
import { CURRENT_LANG } from '../../../core/i18n/language.token'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { DistributionBarEntries } from '../../../diagrams/distribution-bar/distribution-bar.component'
import { COLOR_HOSP_CAP_FREE, COLOR_HOSP_CAP_NON_COVID } from '../../../shared/commons/colors.const'
import { MasterDetailMenuItem } from '../../../shared/components/master-detail/master-detail-menu-item.type'
import { SearchFilterOptionGroup } from '../../../shared/components/search-filter/search-filter-options.type'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { adminFormatNum } from '../../../static-utils/admin-format-num.function'
import { emitValToOwnViewFn } from '../../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../../static-utils/update-query-param.function'
import { RoutePaths } from '../../route-paths.enum'

export const filterGeoNames = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase()
  return opt.filter((item) => item.toLowerCase().indexOf(filterValue) === 0)
}

interface CapacityDetailMenuItem extends MasterDetailMenuItem {
  distributionLabel: string
  distributionData: DistributionBarEntries | null
}

@Component({
  selector: 'bag-capacity',
  templateUrl: './capacity.component.html',
  styleUrls: ['./capacity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapacityComponent implements OnDestroy {
  readonly detailGeoFilterGroups: SearchFilterOptionGroup[] = [
    {
      label: this.translator.get('Commons.Country'),
      options: [
        {
          value: null,
          label: this.translator.get(`GeoFilter.${TopLevelGeoUnit.CH}`),
        },
      ],
    },
    {
      label: this.translator.get('Commons.Canton'),
      // sort alphabetically
      options: getEnumValues(CantonGeoUnit)
        .filter((v) => v !== CantonGeoUnit.FL)
        .map((value) => ({ value, label: this.translator.get(`GeoFilter.${value}`) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    },
  ]

  readonly geoFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GEO_FILTER] || null)
  readonly geoFilter$: Observable<CantonGeoUnit | null> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER),
  )
  readonly detailMenuItems$: Observable<CapacityDetailMenuItem[]>

  private readonly onDestroy = new Subject<void>()

  constructor(
    @Inject(CURRENT_LANG) readonly lang: Language,
    @Inject(LOCALE_ID) locale: string,
    private readonly dataService: DataService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translator: TranslatorService,
  ) {
    this.geoFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.GEO_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))

    // geoFilter might be changed from other controls, so we need to update this controls view
    this.geoFilter$
      .pipe(
        takeUntil(this.onDestroy),
        map((v: any) => (v === TopLevelGeoUnit.CH ? null : v)),
      )
      .subscribe(emitValToOwnViewFn(this.geoFilterCtrl))

    this.detailMenuItems$ = forkJoin([
      this.dataService.loadHospCapacityGeographyData(GdiObject.HOSP_CAPACITY_ICU),
      this.dataService.loadHospCapacityGeographyData(GdiObject.HOSP_CAPACITY_TOTAL),
    ]).pipe(
      switchMap(([icuData, totData]) =>
        this.geoFilter$.pipe(
          map((geoFilter: CantonGeoUnit | TopLevelGeoUnit.CH | null) => {
            if (geoFilter === TopLevelGeoUnit.CH) {
              geoFilter = null
            }
            return {
              geoFilter,
              icuData: geoFilter ? icuData.cantonData[geoFilter] : icuData.chData,
              totData: geoFilter ? totData.cantonData[geoFilter] : totData.chData,
            }
          }),
        ),
      ),
      map(this.prepareDetailMenuItems),
      shareReplay(1),
    )
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  readonly prepareDetailMenuItems = ({
    geoFilter,
    icuData,
    totData,
  }: {
    geoFilter: CantonGeoUnit | null
    icuData: HospCapacityGeoValuesRecord | null
    totData: HospCapacityGeoValuesRecord | null
  }): CapacityDetailMenuItem[] => {
    const basePathArgs = ['/', this.lang, RoutePaths.DASHBOARD_CAPACITY]

    return [
      {
        title: 'HospCapacity.Menu.IntensiveCareUnits.Title',
        distributionLabel:
          icuData && isDefined(icuData.percentage_hospBedsAll)
            ? this.translator.get('HospCapacity.Capacity.Value', {
                value: adminFormatNum(icuData.percentage_hospBedsAll),
              })
            : this.translator.get(
                icuData?.exists === false ? 'HospCapacity.Icu.NoIntensiveCareUnits' : 'Commons.NoData',
              ),
        distributionData:
          icuData && isDefined(icuData.percentage_hospBedsAll)
            ? [
                { ratio: icuData.percentage_hospBedsAll, colorCode: COLOR_HOSP_CAP_NON_COVID },
                { ratio: icuData.percentage_hospBedsFree, colorCode: COLOR_HOSP_CAP_FREE },
              ]
            : null,
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_CAPACITY_ICU],
      },
      {
        title: 'HospCapacity.Menu.TotalCapacity.Title',
        distributionLabel:
          totData && isDefined(totData.percentage_hospBedsAll)
            ? this.translator.get('HospCapacity.Capacity.Value', {
                value: adminFormatNum(totData.percentage_hospBedsAll),
              })
            : this.translator.get(totData?.exists === false ? 'HospCapacity.Total.NoHospital' : 'Commons.NoData'),
        distributionData:
          totData && isDefined(totData.percentage_hospBedsAll)
            ? [
                { ratio: totData.percentage_hospBedsAll, colorCode: COLOR_HOSP_CAP_NON_COVID },
                { ratio: totData.percentage_hospBedsFree, colorCode: COLOR_HOSP_CAP_FREE },
              ]
            : null,
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_CAPACITY_TOTAL],
      },
    ].map((item) => ({
      ...item,
      title: geoFilter ? `${this.translator.get(item.title)}, ${geoFilter}` : this.translator.get(item.title),
    }))
  }
}
