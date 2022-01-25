import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet><sc-flying-focus></sc-flying-focus>',
  styles: [
    `
      app-root {
        display: block;
        --d-sticky-detail-filter-height: calc(
          var(--d-sticky-detail-filter-base-height) + var(--d-sticky-detail-filter-reset-addon) *
            var(--sticky-detail-filter-reset-enabled)
        );
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  private readonly styleProperties: Record<string, string> = {}

  constructor(private elRef: ElementRef<HTMLElement>) {}

  setStyleProperty(prop: string, value: string | null) {
    if (value === null) {
      delete this.styleProperties[prop]
    } else {
      this.styleProperties[prop] = value
    }
    const styles = Object.entries(this.styleProperties)
      .map(([k, v]) => `${k}:${v};`)
      .join(' ')
    this.elRef.nativeElement.setAttribute('style', styles)
  }
}
