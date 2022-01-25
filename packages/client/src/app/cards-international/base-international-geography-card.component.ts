import { Component, Input, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { IntGeoUnit, Iso2Country } from '@c19/commons'
import { combineLatest, Observable } from 'rxjs'
import { filter, map, takeUntil, tap } from 'rxjs/operators'
import { ExtendedGeoFeatureCollection } from '../diagrams/choropleth/base-choropleth.component'
import {
  DEFAULT_INT_MAP_ZOOM_FILTER,
  getIntMapZoomFilterOptions,
  IntMapZoomFilter,
} from '../shared/models/filters/int-geo-filter.enum'
import { QueryParams } from '../shared/models/query-params.enum'
import { emitValToOwnViewFn } from '../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../static-utils/update-query-param.function'
import { BaseInternationalCardComponent } from './base-international-card.component'

export interface ZoomOptions {
  zoomGeoUnit: IntGeoUnit | null
  zoomMaxExtent: number | null
}

@Component({ template: '' })
export abstract class BaseInternationalGeographyCardComponent extends BaseInternationalCardComponent implements OnInit {
  @Input()
  geoJson: ExtendedGeoFeatureCollection

  readonly mapZoomFilterOptions = getIntMapZoomFilterOptions()
  readonly mapZoomFilterCtrl = new FormControl(this.initialMapZoomCtrlValue())
  protected readonly mapZoomFilter$: Observable<IntMapZoomFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.MAP_ZOOM_FILTER, null),
    map((v, ix) => (ix === 0 && v === null ? DEFAULT_INT_MAP_ZOOM_FILTER : v)),
    tap<IntMapZoomFilter>(emitValToOwnViewFn(this.mapZoomFilterCtrl)),
  )
  protected readonly currentIntGeoValues$ = combineLatest([
    this.mapZoomFilter$,
    this.geoUnitFilter$,
    this.onChanges$,
  ]).pipe(
    filter(([mapZoom, geoUnit]) => {
      if (geoUnit) {
        return true
      } else {
        return mapZoom !== null
      }
    }),
  )

  ngOnInit() {
    this.mapZoomFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.MAP_ZOOM_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  mapZoomedOrMoved(zoomedOrMoved: boolean) {
    if (zoomedOrMoved) {
      this.mapZoomFilterCtrl.setValue(null)
    }
  }

  /**
   *
   * @returns [zoomGeoUnit, zoomMaxExtent]
   */
  protected getZoomOptions(geoUnit: IntGeoUnit | null, mapZoom: IntMapZoomFilter): ZoomOptions {
    if (!geoUnit) {
      switch (mapZoom) {
        case IntMapZoomFilter.EUROPE:
          return { zoomGeoUnit: Iso2Country.BE, zoomMaxExtent: 4 }
        case IntMapZoomFilter.NEIGHBOURS:
          return { zoomGeoUnit: Iso2Country.CH, zoomMaxExtent: 12 }
      }
    }
    return { zoomGeoUnit: null, zoomMaxExtent: null }
  }

  private initialMapZoomCtrlValue() {
    const geoUnit = this.route.snapshot.queryParams[QueryParams.GEO_FILTER]
    return geoUnit ? null : this.route.snapshot.queryParams[QueryParams.MAP_ZOOM_FILTER] || DEFAULT_INT_MAP_ZOOM_FILTER
  }
}
