import { Directive, ElementRef, Input } from '@angular/core'

const LOREM_1 =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Felis bibendum ut tristique et. Placerat duis ultricies lacus sed turpis tincidunt id aliquet risus. Mattis nunc sed blandit libero volutpat sed cras ornare arcu. Nisl vel pretium lectus quam. Eros donec ac odio tempor orci dapibus ultrices. Integer eget aliquet nibh praesent tristique magna sit. Ultrices vitae auctor eu augue ut lectus arcu. Turpis in eu mi bibendum neque egestas congue quisque egestas. Diam phasellus vestibulum lorem sed risus ultricies. Tellus rutrum tellus pellentesque eu tincidunt.'
const LOREM_2 =
  'Sollicitudin aliquam ultrices sagittis orci. Faucibus vitae aliquet nec ullamcorper sit amet risus nullam eget. Eu mi bibendum neque egestas. Scelerisque felis imperdiet proin fermentum leo vel orci porta non. Ridiculus mus mauris vitae ultricies. Vulputate dignissim suspendisse in est ante in nibh. Turpis massa sed elementum tempus egestas sed sed risus pretium. Eget nullam non nisi est sit amet facilisis magna. Viverra accumsan in nisl nisi. Faucibus a pellentesque sit amet porttitor. Sollicitudin ac orci phasellus egestas. Nullam vehicula ipsum a arcu cursus vitae congue.'
const LOREM_3 =
  'Odio aenean sed adipiscing diam donec adipiscing tristique. Ac turpis egestas maecenas pharetra convallis posuere morbi. Eget velit aliquet sagittis id consectetur purus. Neque convallis a cras semper auctor neque vitae tempus. Ornare arcu dui vivamus arcu felis bibendum. Vestibulum mattis ullamcorper velit sed. Aliquet porttitor lacus luctus accumsan tortor posuere ac ut consequat. Id neque aliquam vestibulum morbi blandit cursus risus. Mi ipsum faucibus vitae aliquet nec ullamcorper sit. Lacus sed viverra tellus in hac habitasse. Parturient montes nascetur ridiculus mus mauris vitae ultricies leo. Nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum. Id eu nisl nunc mi ipsum faucibus vitae aliquet. Duis at tellus at urna. In egestas erat imperdiet sed. Aenean sed adipiscing diam donec adipiscing tristique risus. Ac ut consequat semper viverra nam libero. Dui id ornare arcu odio ut.'
const LOREM = [LOREM_1, LOREM_2, LOREM_3].join('\n')

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[sgLorem]' })
export class LoremDirective {
  @Input('sgLorem')
  set wordCount(val: number) {
    this._val = val || 50
    this.update()
  }

  get wordCount(): number {
    return this._val
  }

  private _val: number

  constructor(readonly elRef: ElementRef) {}

  private update() {
    this.elRef.nativeElement.innerHTML = LOREM.split(/\s/).slice(0, this.wordCount).join(' ')
  }
}
