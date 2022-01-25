import { NgModule } from '@angular/core'
import { FmtIsoWeekPipePipe } from './fmt-iso-week.pipe'
import { I18nCheckKeyPipe } from './i18n-check-key.pipe'
import { I18nPipe } from './i18n.pipe'
import { IntersectionDirective } from './intersection.directive'
import { ReplaceHyphenWithEnDashPipe } from './replace-hyphen-with-en-dash.pipe'
import { ToDatePipe } from './to-date.pipe'
import { AdminNumPipe } from './admin-num.pipe'
import { FmtDatePipe } from './fmt-date.pipe'
import { TranslateDirective } from './translate.directive'
import { ParseIsoDatePipe } from './parse-iso-date.pipe'
import { IsDefinedPipe } from './is-defined.pipe'
import { SvgAnimateDirective } from './svg-animate.directive'

@NgModule({
  imports: [],
  declarations: [
    I18nPipe,
    I18nCheckKeyPipe,
    ToDatePipe,
    IntersectionDirective,
    AdminNumPipe,
    TranslateDirective,
    FmtDatePipe,
    ParseIsoDatePipe,
    FmtIsoWeekPipePipe,
    IsDefinedPipe,
    SvgAnimateDirective,
    ReplaceHyphenWithEnDashPipe,
  ],
  exports: [
    I18nPipe,
    I18nCheckKeyPipe,
    ToDatePipe,
    IntersectionDirective,
    AdminNumPipe,
    TranslateDirective,
    FmtDatePipe,
    ParseIsoDatePipe,
    FmtIsoWeekPipePipe,
    IsDefinedPipe,
    SvgAnimateDirective,
    ReplaceHyphenWithEnDashPipe,
  ],
})
export class CommonsModule {}
