import 'zone.js/node'

import { APP_BASE_HREF } from '@angular/common'
import { enableProdMode } from '@angular/core'
import { ngExpressEngine } from '@nguniversal/express-engine'
import * as express from 'express'
import { AppServerModule } from './app/app.server.module'
import { API_AUTH } from './app/core/api-auth'
import { environment } from './environments/environment'

if (environment.production) {
  enableProdMode()
}

export function createApp(
  distFolder: string,
  sMaxAge: number | null,
  serveAssets: boolean,
  serveClientConfigAsAsset: boolean,
  apiAuth: string,
) {
  const server = express()

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({ bootstrap: AppServerModule, inlineCriticalCss: false }))

  server.set('view engine', 'html')
  server.set('views', distFolder)
  server.disable('x-powered-by')

  if (sMaxAge !== null) {
    server.use((req, res, next) => {
      // add caching headers according to stage --> production: 360 days | nonProd: 30 min
      res.setHeader('Cache-Control', [`max-age=0, must-revalidate, s-maxage=${sMaxAge}`])
      next()
    })
  }

  if (serveClientConfigAsAsset) {
    // serve /client-config from distFolder (used locally)
    server.get('/client-config', (_, res) => res.sendFile(`${distFolder}/client-config`))
  }

  // All regular routes use the Universal engine
  server.get(/^((?!\.).)*$/, (req, res) => {
    const providers = [
      { provide: APP_BASE_HREF, useValue: req.baseUrl },
      { provide: API_AUTH, useValue: apiAuth },
    ]
    res.render('index', { req, providers })
  })

  if (serveAssets) {
    // Serve static files from distFolder (used locally)
    server.get('*.*', <any>express.static(distFolder, { maxAge: '1y' }))
  }

  return server
}
