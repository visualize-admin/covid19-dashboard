import { Directive } from '@angular/core'

// tslint:disable-next-line:no-host-metadata-property
@Directive({ selector: '[bagOverviewCardHint]', host: { '[class.card__hint]': 'true' } })
export class OverviewCardHintDirective {}
