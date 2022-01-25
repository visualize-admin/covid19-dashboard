import { splitByHtmlTags } from './split-by-html-tags.function'

describe('splitByHtmlTags', () => {
  it('works with tag-only', () => {
    expect(splitByHtmlTags('<a href="https://link.com">link text</a>')).toEqual([
      '<a href="https://link.com">',
      'link text',
      '</a>',
    ])
  })
  it('works with surrounding text', () => {
    expect(splitByHtmlTags('Here is my Link: <a href="https://link.com">link text</a>. Did you like it?')).toEqual([
      'Here is my Link: ',
      '<a href="https://link.com">',
      'link text',
      '</a>',
      '. Did you like it?',
    ])
  })
  it('works self closing tags', () => {
    expect(splitByHtmlTags('Here is my paragraph.<br/>And my second line')).toEqual([
      'Here is my paragraph.',
      '<br/>',
      'And my second line',
    ])
  })
  it('works with multiple various tags', () => {
    expect(
      splitByHtmlTags(
        'This is <b>bold</b>. This is <i class="italic">italic</i> and this is a <a href="https://link.com">link</a>',
      ),
    ).toEqual([
      'This is ',
      '<b>',
      'bold',
      '</b>',
      '. This is ',
      '<i class="italic">',
      'italic',
      '</i>',
      ' and this is a ',
      '<a href="https://link.com">',
      'link',
      '</a>',
    ])
  })
})
