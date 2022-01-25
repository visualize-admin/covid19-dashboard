// USED FROM CLIENT / LAMBDA FUNCTIONS

/**
 * not frequently or dynamically changed configurations
 */
import { Language } from './models/language.enum'

export const LANGUAGE_FALLBACK = Language.DE
export const LANGUAGE_COOKIE_NAME = 'X-Language'
// 360 Days
export const LANGUAGE_MAX_AGE = 31104000 // 360 * 24 * 60 * 60

export const CLIENT_CONFIG_PATH = 'client-config'

export const API_PATH = 'api'
export const API_DATA_PATH = 'data'
export const API_RENDERER_PATH = 'renderer'

// 30 Days
export const SEGMENT_MAX_AGE = 2592000 // 30 * 24 * 60 * 60

export const SSR_CONFIG_ENV_VAR = 'SSR_CONFIG'
