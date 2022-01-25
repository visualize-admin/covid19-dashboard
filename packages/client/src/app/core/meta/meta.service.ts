import { DOCUMENT } from '@angular/common'
import { Inject, Injectable } from '@angular/core'
import { Meta, MetaDefinition, Title } from '@angular/platform-browser'
import { ActivatedRouteSnapshot, ActivationEnd, NavigationEnd, Router } from '@angular/router'
import { ClientConfig, Language, LANGUAGE_FALLBACK } from '@c19/commons'
import { filterIfInstanceOf, filterIfTruthy, Logger, LoggerService, ORIGIN } from '@shiftcode/ngx-core'
import { getEnumValues } from '@shiftcode/utilities'
import { Observable } from 'rxjs'
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators'
import { RouteDataKey } from '../../routes/route-data-key.enum'
import { ClientConfigService } from '../client-config.service'
import { CURRENT_LANG } from '../i18n/language.token'
import { AltUrl, AltUrls } from './alt-url.type'
import { SeoMeta } from './seo-meta.type'

const SOCIAL_SHARE_DATA_TAGS: Record<keyof SeoMeta, Array<MetaDefinition>> = {
  title: [
    { name: 'title' },
    { property: 'og:title' },
    { property: 'og:image:alt' },
    { name: 'twitter:title' },
    { name: 'twitter:image:alt' },
  ],
  description: [{ name: 'description' }, { property: 'og:description' }, { name: 'twitter:description' }],
  url: [{ property: 'og:url' }],
  image: [{ name: 'twitter:image' }, { property: 'og:image' }],
  published: [{ name: 'article:published_time' }, { name: 'publication_date' }],
  modified: [{ name: 'article:modified_time' }, { property: 'og:updated_time' }],
  author: [{ name: 'article:author' }, { name: 'author' }],
  section: [{ name: 'article:section' }],
  type: [{ property: 'og:type' }],
}

@Injectable({ providedIn: 'root' })
export class MetaService {
  readonly altUrls$: Observable<AltUrls>
  readonly routeMetaData$: Observable<SeoMeta>
  private readonly logger: Logger

  static getRouteMetaData(snapshot: ActivatedRouteSnapshot): SeoMeta | null {
    const meta = snapshot.data[RouteDataKey.SEO_META]
    if (meta) {
      return meta
    } else if (snapshot.parent) {
      return MetaService.getRouteMetaData(snapshot.parent)
    }
    return null
  }

  constructor(
    loggerService: LoggerService,
    @Inject(DOCUMENT) private readonly doc: Document,
    @Inject(ORIGIN) private readonly origin: string,
    @Inject(CURRENT_LANG) private readonly currentLanguage: Language,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly router: Router,
    private readonly clientConfig: ClientConfigService,
  ) {
    this.logger = loggerService.getInstance('MetaService')

    this.routeMetaData$ = this.router.events.pipe(
      filterIfInstanceOf(ActivationEnd),
      filter((ev) => !ev.snapshot.children.length),
      map(({ snapshot }) => MetaService.getRouteMetaData(snapshot)),
      distinctUntilChanged(),
      filterIfTruthy(),
      shareReplay(1),
    )

    this.altUrls$ = this.router.events.pipe(
      filterIfInstanceOf(NavigationEnd),
      map(this.createAltUrls),
      filterIfTruthy(),
      shareReplay(1),
    )
  }

  async setup() {
    this.logger.debug('setup')
    const config: ClientConfig = await this.clientConfig.config$

    // set document language
    this.doc.documentElement.setAttribute('lang', this.currentLanguage)

    // set noindex meta tag on none prod envs
    if (!config.common.productionFlag) {
      this.setNoIndex()
    }

    this.routeMetaData$.subscribe(this.setMetaData)
    this.altUrls$.subscribe(this.updateRelLinks)
  }

  private setNoIndex() {
    this.meta.addTag({ name: 'robots', content: 'noindex' })
  }

  private readonly createAltUrls = ({ urlAfterRedirects }: NavigationEnd): AltUrls | null => {
    const regex = new RegExp(`^/${this.currentLanguage}/([^?]+)(\\?.+)?`)
    const m = regex.exec(urlAfterRedirects)
    if (!m) {
      this.logger.info('could not create alternate urls because no lang in url')
      return null
    }

    const languages = <Language[]>getEnumValues(Language)

    return languages
      .map((lang): AltUrl => {
        const canonicalUrl = `${this.origin}/${lang}/${m[1]}`
        const altUrl = `${this.origin}/${lang}/${m[1]}${m[2] || ''}`
        return { lang, altUrl, canonicalUrl }
      })
      .reduce((u, i) => {
        u[i.lang] = i
        return u
      }, <AltUrls>{})
  }

  private readonly updateRelLinks = (altUrls: AltUrls) => {
    Object.values(altUrls).forEach(({ lang, altUrl }) => this.updateLangHrefLink(lang, altUrl, 'alternate'))
    this.updateLangHrefLink('x-default', altUrls[LANGUAGE_FALLBACK].altUrl, 'alternate')
    this.updateLangHrefLink(this.currentLanguage, altUrls[this.currentLanguage].canonicalUrl, 'canonical')
  }

  private readonly setMetaData = (seoMeta: SeoMeta) => {
    this.logger.debug('setMetaData', seoMeta)

    this.title.setTitle(seoMeta.title)

    const metaData: SeoMeta = {
      ...seoMeta,
      url: `${this.origin}${this.router.url}`,
      image: `${this.origin}/assets/favicon/open-graph-v1.png`,
    }

    ;(<Array<[keyof SeoMeta, string | null]>>(<any>Object.entries(metaData))).forEach(([key, content]) => {
      if (content) {
        SOCIAL_SHARE_DATA_TAGS[key]
          .map((md) => <MetaDefinition>{ ...md, content })
          .forEach((md) => this.meta.updateTag(md))
      } else {
        SOCIAL_SHARE_DATA_TAGS[key]
          .map((md) => (md.name ? `name='${md.name}'` : md.property ? `property='${md.property}'` : ''))
          .forEach((attrSelector) => this.meta.removeTag(attrSelector))
      }
    })

    // special
    if (metaData.image) {
      this.meta.updateTag({ property: 'og:image:type', content: 'image/png' })
      this.meta.updateTag({ property: 'og:image:height', content: '300' })
      this.meta.updateTag({ property: 'og:image:width', content: '300' })
    } else {
      this.meta.removeTag("property='og:image:type'")
      this.meta.removeTag("property='og:image:width'")
      this.meta.removeTag("property='og:image:height'")
    }
  }

  private updateLangHrefLink(lang: string, href: string, type: 'alternate' | 'canonical') {
    const linkSelector = type === 'alternate' ? `link[rel="alternate"][hreflang="${lang}"]` : 'link[rel="canonical"]'
    const list: NodeList = this.doc.head.querySelectorAll(linkSelector)

    let el: HTMLLinkElement | undefined = <HTMLLinkElement>list[0]
    if (!el) {
      el = this.doc.createElement('link')
      el.setAttribute('rel', type)
      el.setAttribute('href', href)
      if (type === 'alternate') {
        el.setAttribute('hreflang', lang)
      }
      this.doc.head.appendChild(el)
    }
    el.setAttribute('href', href)
  }
}
