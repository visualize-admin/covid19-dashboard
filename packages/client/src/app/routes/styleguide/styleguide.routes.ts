import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { RouteDataKey } from '../route-data-key.enum'
import { SgChoroplethDataResolver } from './sg-choropleth/sg-choropleth-data.resolver'
import { SgChoroplethGeoJsonResolver } from './sg-choropleth/sg-choropleth-geojson.resolver'
import { SgChoroplethComponent } from './sg-choropleth/sg-choropleth.component'
import { SgColumnChartComponent } from './sg-column-chart/sg-column-chart.component'
import { SgComponentsComponent } from './sg-components/sg-components.component'
import { SgHeatmapRowComponent } from './sg-heatmap-row/sg-heatmap-row.component'
import { SgHistogramComponent } from './sg-histogram/sg-histogram.component'
import { SgMatrixDiagramsComponent } from './sg-matrix-diagrams/sg-matrix-diagrams.component'
import { SgTypographyComponent } from './sg-typography/sg-typography.component'
import { StyleguideComponent } from './styleguide.component'

const styleguideRoutes: Routes = [
  {
    path: '',
    component: StyleguideComponent,
    children: [
      { path: 'typography', component: SgTypographyComponent },
      { path: 'histogram', component: SgHistogramComponent },
      { path: 'matrix', component: SgMatrixDiagramsComponent },
      {
        path: 'choropleth',
        component: SgChoroplethComponent,
        resolve: {
          [RouteDataKey.DETAIL_DATA]: SgChoroplethDataResolver,
          [RouteDataKey.GEO_JSON]: SgChoroplethGeoJsonResolver,
        },
      },
      { path: 'column-chart', component: SgColumnChartComponent },
      { path: 'components', component: SgComponentsComponent },
      { path: 'heatmap-row', component: SgHeatmapRowComponent },
      { path: '', pathMatch: 'full', redirectTo: 'typography' },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(styleguideRoutes)],
  providers: [SgChoroplethDataResolver, SgChoroplethGeoJsonResolver],
  exports: [RouterModule],
})
export class StyleguideRouterModule {}
