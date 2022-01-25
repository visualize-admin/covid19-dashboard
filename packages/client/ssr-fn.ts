import { SrrEnvConfig, SSR_CONFIG_ENV_VAR } from '@c19/commons'
import { createServer, proxy } from 'aws-serverless-express'
import { join } from 'path'
import { createApp } from './src/main.server'

const DIST_FOLDER = join(process.cwd(), 'browser/')
const BIN_MIME_TYPES = [
  'application/javascript',
  'application/json',
  'application/octet-stream',
  'application/xml',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/comma-separated-values',
  'text/css',
  'text/javascript',
  'text/plain',
  'text/text',
  'text/xml',
  'image/x-icon',
  'image/svg+xml',
  'application/x-font-ttf',
]

if (!process.env || !process.env[SSR_CONFIG_ENV_VAR]) {
  throw new Error(`${SSR_CONFIG_ENV_VAR} not available as env var`)
}
const config: SrrEnvConfig = JSON.parse(<string>process.env[SSR_CONFIG_ENV_VAR])
const sMaxAge = config.common.productionFlag ? 31104000 : 1800

const app = createApp(DIST_FOLDER, sMaxAge, false, false, config.apiAuth)

const server = createServer(app, () => {}, BIN_MIME_TYPES)

export const handler = (event: any, context: any) => proxy(server, event, context)
