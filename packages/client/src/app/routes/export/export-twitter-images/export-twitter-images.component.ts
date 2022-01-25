import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { OverviewDataV4 } from '@c19/commons'
import { PathParams } from '../../../shared/models/path-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'

export enum TwitterImages {
  CASE_TEST = 'case-test',
  HOSP_DEATH = 'hosp-death',
  VARAINTS_REPRO = 'variants-repro',
  HOSP_HOSPCAP = 'hosp-hospCap',
}

@Component({
  selector: 'bag-export-twitter-images',
  templateUrl: './export-twitter-images.component.html',
  styleUrls: ['./export-twitter-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportTwitterImagesComponent {
  readonly TwitterImages = TwitterImages
  readonly data: OverviewDataV4 = this.route.snapshot.data[RouteDataKey.OVERVIEW_DATA]
  readonly exportType: TwitterImages = this.route.snapshot.params[PathParams.CARD_TYPE]

  constructor(private readonly route: ActivatedRoute) {}
}
