import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { SvgModule, TextareaAutosizeModule } from '@shiftcode/ngx-components'
import { DataGuard } from '../../core/data/data.guard'
import { OverviewDataResolver } from '../../core/overview-data-resolver.service'
import { CommonsModule } from '../../shared/commons/commons.module'
import { HeaderModule } from '../../shared/components/header/header.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { RouteDataKey } from '../route-data-key.enum'
import { SocialMediaExportComponent } from './social-media-export.component'
import { TweetPreparationComponent } from './tweet-preparation/tweet-preparation.component'

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SocialMediaExportComponent,
        canActivate: [DataGuard],
        resolve: {
          [RouteDataKey.OVERVIEW_DATA]: OverviewDataResolver,
        },
      },
    ]),
    HeaderModule,
    ReactiveFormsModule,
    TextareaAutosizeModule,
    CommonsModule,
    NativeSelectModule,
    SvgModule,
  ],
  declarations: [SocialMediaExportComponent, TweetPreparationComponent],
})
export class SocialMediaExportModule {}
