import { splitByHtmlTags } from '../../static-utils/split-by-html-tags.function'
import { TextArgs } from './translator.service'

const ZERO_WIDTH_NBSP = String.fromCharCode(8288)
const NBSP = String.fromCharCode(160)

/**
 * append a zero-width non-breaking space after each hyphen
 * (we do not actually replace the hyphen with a non-breaking hyphen since this doesn't work fine.)
 */
export function replaceHyphens(text: string): string {
  return text.replace(/([^\s]-)([^\s])/g, `$1${ZERO_WIDTH_NBSP}$2`) // ${String.fromCharCode(8209)}
}
export function replaceNumSpaces(text: string): string {
  return text.replace(/(\d)\s(\d)/g, `$1${NBSP}$2`)
}

/**
 * replace hyphens when appropriate
 */
export function tryReplaceHyphensAndNumSpaces(text: string): string {
  if (text.startsWith('https://')) {
    // if the text is just a url, we return as is
    return text
  }
  if (!/<[a-z\-]+[^>]*>/i.test(text)) {
    // if the text does not contain html tags, replace all hyphens normally
    return replaceNumSpaces(replaceHyphens(text))
  }
  // if the text contains tags, split by those and handle each part individually
  return splitByHtmlTags(text)
    .map((part) => (part.startsWith('<') ? part : replaceNumSpaces(replaceHyphens(part))))
    .join('')
}

/**
 * interpolate arguments in text with the format {arg}
 */
export function interpolate(text: string, args: TextArgs): string {
  return Object.entries(args || {}).reduce((u, [k, v]) => u.replace(`{${k}}`, <string>v), text)
}

export function interpolateRegexGlobal(text: string, args: TextArgs): string {
  return Object.entries(args || {}).reduce((u, [k, v]) => u.replace(new RegExp(`{${k}}`, 'g'), <string>v), text)
}
