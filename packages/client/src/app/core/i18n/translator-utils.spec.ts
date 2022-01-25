import {
  interpolate,
  interpolateRegexGlobal,
  replaceHyphens,
  replaceNumSpaces,
  tryReplaceHyphensAndNumSpaces,
} from './translator-utils'

const ZW_NBSP = String.fromCharCode(8288)
const NBSP = String.fromCharCode(160)

describe('translator-utils.ts', () => {
  describe('replaceHyphens', () => {
    it('works on multiple hyphens', () => {
      expect(replaceHyphens('hey-there covid-19')).toEqual(`hey-${ZW_NBSP}there covid-${ZW_NBSP}19`)
    })
    it('does not apply when a space follows', () => {
      expect(replaceHyphens('In- und Auswending')).toEqual(`In- und Auswending`)
    })
  })

  describe('replaceNumSpaces', () => {
    it('works on single case', () => {
      expect(replaceNumSpaces('per 100 000 inhabitants')).toEqual(`per 100${NBSP}000 inhabitants`)
    })
    it('works on multiple cases', () => {
      expect(replaceNumSpaces('per 100 000 inhabitants or per 1 000 000')).toEqual(
        `per 100${NBSP}000 inhabitants or per 1${NBSP}000${NBSP}000`,
      )
    })
  })

  describe('tryReplaceHyphensAndNumSpaces', () => {
    it('works on simple strings', () => {
      expect(tryReplaceHyphensAndNumSpaces('Wir kennen Covid-19 In- und Auswending')).toEqual(
        `Wir kennen Covid-${ZW_NBSP}19 In- und Auswending`,
      )

      expect(tryReplaceHyphensAndNumSpaces('pro 100 000 Einw.')).toEqual(`pro 100${NBSP}000 Einw.`)

      expect(tryReplaceHyphensAndNumSpaces('Covid-19 Fälle pro 100 000 Einw.')).toEqual(
        `Covid-${ZW_NBSP}19 Fälle pro 100${NBSP}000 Einw.`,
      )
    })

    it('does not alter https links', () => {
      expect(tryReplaceHyphensAndNumSpaces('https://www.covid-19.admin.ch')).toEqual(`https://www.covid-19.admin.ch`)
    })

    it('does not alter html tags', () => {
      expect(tryReplaceHyphensAndNumSpaces('Siehe <a href="https://www.covid-19.admin.ch">Covid-19</a>')).toEqual(
        `Siehe <a href="https://www.covid-19.admin.ch">Covid-${ZW_NBSP}19</a>`,
      )

      expect(
        tryReplaceHyphensAndNumSpaces(
          'Siehe <a href="https://www.covid-19.admin.ch" class="99 44">Covid-19 pro 60 400</a>',
        ),
      ).toEqual(`Siehe <a href="https://www.covid-19.admin.ch" class="99 44">Covid-${ZW_NBSP}19 pro 60${NBSP}400</a>`)
    })
  })

  describe('interpolate', () => {
    it('works on multiple arguments', () => {
      expect(interpolate('mein Name is {name} und ich bin ein {job}.', { name: 'Pesche', job: 'Developeter' })).toEqual(
        'mein Name is Pesche und ich bin ein Developeter.',
      )
    })
    it('only replaces first occurrence', () => {
      expect(interpolate('mein Name is {name} und ich heisse {name}.', { name: 'Pesche' })).toEqual(
        'mein Name is Pesche und ich heisse {name}.',
      )
    })
  })
  describe('interpolateRegexGlobal', () => {
    it('works on multiple arguments', () => {
      expect(
        interpolateRegexGlobal('mein Name is {name} und ich bin ein {job}.', { name: 'Pesche', job: 'Developeter' }),
      ).toEqual('mein Name is Pesche und ich bin ein Developeter.')
    })
    it('replaces ALL occurrence', () => {
      expect(interpolateRegexGlobal('mein Name is {name} und ich heisse {name}.', { name: 'Pesche' })).toEqual(
        'mein Name is Pesche und ich heisse Pesche.',
      )
    })
  })
})
