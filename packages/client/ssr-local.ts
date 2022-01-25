import { join } from 'path'
import { createApp } from './src/main.server'

const distFolder = join(process.cwd(), 'dist/browser')

const apiAuth = process.env.DATA_ENDPOINT_AUTH ?? ''

const app = createApp(distFolder, null, true, true, apiAuth)

app.listen(process.env.PORT || 4000)
