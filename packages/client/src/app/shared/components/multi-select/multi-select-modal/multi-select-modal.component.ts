import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Inject,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core'
import { ModalRef } from '../../_modal/modal-ref'
import { OptionSelectionChange } from '../../option/option-selection-change.model'
import { OptionComponent } from '../../option/option.component'
import { MODAL_DATA } from '../../_modal/modal-data.token'
import { MODAL_REF } from '../../_modal/modal-ref.token'
import { MultiSelectOption } from '../multi-select-option.type'

export interface MultiSelectModalData<T extends MultiSelectOption> {
  options: T[]
  selected: T[]
}

@Component({
  selector: 'bag-multi-select-modal',
  templateUrl: './multi-select-modal.component.html',
  styleUrls: ['./multi-select-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectModalComponent<T extends MultiSelectOption> implements AfterViewInit {
  @ViewChildren(OptionComponent)
  options: QueryList<OptionComponent>

  // filter from all options to keep the original sort order
  private get sortedSelection(): T[] {
    return this.options
      .toArray()
      .map((o) => o.value)
      .filter((v) => this.selection.includes(v))
  }

  private selection: T[]
  private _focusIndex = 0
  private readonly allOptions: T[]

  constructor(
    @Inject(MODAL_REF) readonly ref: ModalRef<T[]>,
    @Inject(MODAL_DATA) readonly data: MultiSelectModalData<T>,
  ) {
    this.selection = [...data.selected]
    this.allOptions = [...data.options]
  }

  ngAfterViewInit() {
    this.options.first.focus()
  }

  get selectAllDisabled(): boolean {
    return this.selection.length === this.allOptions.length
  }

  get isSelectionEmpty(): boolean {
    return this.selection.length === 0
  }

  onOptionSelectionChanged(event: OptionSelectionChange) {
    const opt: T = event.source.value
    if (this.isSelected(opt)) {
      const ix = this.selection.indexOf(opt)
      this.selection.splice(ix, 1)
    } else {
      this.selection.push(opt)
    }
  }

  selectAll() {
    this.selection = this.allOptions
  }

  isSelected(opt: T): boolean {
    return this.selection.includes(opt)
  }

  submit() {
    this.ref.change({ result: this.sortedSelection })
    this.ref.close({ focusSelf: true, result: this.sortedSelection })
  }

  /**
   * if a link or button was hit by enter, close the modal
   */
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    // since we set the focus on the option, Enter/space is handler automatically
    if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
      if (this.options && this.options.length) {
        event.preventDefault()
        const mod = event.code === 'ArrowDown' ? 1 : -1
        const ix = (this.options.length + this._focusIndex + mod) % this.options.length
        this._focusIndex = ix
        this.options.toArray()[ix].focus()
      }
    } else if (event.code === 'Escape') {
      this.ref.close({ focusSelf: true, result: this.sortedSelection })
    }
  }
}
