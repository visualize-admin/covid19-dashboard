import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'

export type NotificationType = 'info' | 'full'

@Component({
  selector: 'bag-page-notification',
  templateUrl: './page-notification.component.html',
  styleUrls: ['./page-notification.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotificationComponent {
  @Input()
  type: NotificationType = 'info'

  constructor() {}
}
