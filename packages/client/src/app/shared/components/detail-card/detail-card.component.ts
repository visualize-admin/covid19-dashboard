import { ChangeDetectionStrategy, Component, ContentChild, HostBinding, Input, ViewEncapsulation } from '@angular/core'
import { isDefined } from '@c19/commons'
import { ImageDownloadUrls } from '../../../cards-epidemiologic/base-detail-epidemiologic-card.component'
import { TextArgs, TranslatorService } from '../../../core/i18n/translator.service'
import { getDataStatusArgs } from '../../../static-utils/date-utils'
import { DetailCardAddonDirective } from './detail-card-addon.directive'

export interface Source {
  date: Date | null
  sourceKey: string
  descKey?: string
}

@Component({
  selector: 'bag-detail-card',
  templateUrl: './detail-card.component.html',
  styleUrls: ['./detail-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardComponent {
  private static INSTANCE_COUNTER = 0

  @Input()
  detailUrl: string | null

  @Input()
  downloadUrls: ImageDownloadUrls | null

  @Input()
  titleKey: string

  @Input()
  infoKey?: string | null

  @Input()
  infoArgs?: TextArgs | null

  @Input()
  infoAddOnKey?: string | null

  @Input()
  warnKey?: string | null

  @Input()
  sources: Array<Source>

  @Input()
  description: string | null

  @Input()
  hideInfo = false

  @Input()
  facet: 'print' | undefined | null

  @ContentChild(DetailCardAddonDirective)
  detailCardAddon?: DetailCardAddonDirective

  @HostBinding('class.--print')
  get isFacetPrint(): boolean {
    return this.facet === 'print'
  }

  @HostBinding('class.--default')
  get isFacetDefault(): boolean {
    return !isDefined(this.facet)
  }

  get descriptionText(): string {
    const plainDesc = (this.description || '').replace(/<[^>]*>?/gm, '')
    return `${this.translator.get(this.titleKey)} - ${plainDesc}`
  }

  get infoMoreKey() {
    return `${this.infoKey}.More`
  }

  readonly instanceNum = ++DetailCardComponent.INSTANCE_COUNTER
  readonly sourceElId = `detail-card-${this.instanceNum}__source`
  showMore = false

  constructor(private readonly translator: TranslatorService) {}

  getSourceText(source: Source): string | null {
    const sourceBaseTxt = this.translator.get('Commons.Source')
    const sourceDesc = source.descKey ? ` (${this.translator.get(source.descKey)})` : ''
    const dataStatus = source.date
      ? `&nbsp;– ${this.translator.get('Commons.DataStatus', getDataStatusArgs(source.date))}`
      : ''
    return `<span>${sourceBaseTxt}${sourceDesc}: ${this.translator.get(
      source.sourceKey,
    )}</span><span>${dataStatus}</span>`
  }

  toggleMoreInfo() {
    this.showMore = !this.showMore
  }
}
