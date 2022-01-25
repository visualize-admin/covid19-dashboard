import { DOWN_ARROW, hasModifierKey } from '@angular/cdk/keycodes'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { Observable, Subject } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, startWith, tap } from 'rxjs/operators'
import { normalizeString } from '../../../../static-utils/normalize-string.function'
import { MODAL_DATA } from '../../_modal/modal-data.token'
import { ModalRef } from '../../_modal/modal-ref'
import { MODAL_REF } from '../../_modal/modal-ref.token'
import { OptionSelectionChange } from '../../option/option-selection-change.model'
import { OptionComponent } from '../../option/option.component'
import { SearchFilterOption, SearchFilterOptionGroup } from '../search-filter-options.type'

export interface SearchListModalData {
  selected: SearchFilterOption['value']
  groups: SearchFilterOptionGroup[]
  fileDescription: string
  noGrouping?: boolean
}

@Component({
  selector: 'bag-search-list-modal',
  templateUrl: './search-list-modal.component.html',
  styleUrls: ['./search-list-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchListModalComponent implements AfterViewInit, OnDestroy {
  private static INSTANCE_COUNTER = 0

  @ViewChild('inputField')
  inputFieldRef: ElementRef

  @ViewChildren(OptionComponent)
  options: QueryList<OptionComponent>

  get element() {
    return this.elementRef.nativeElement
  }

  get searchInputId() {
    return `bag-search-list-modal-input-${this.instanceNum}`
  }

  readonly filteredGroups$: Observable<SearchFilterOptionGroup[]>
  readonly searchCtrl = new FormControl()

  private readonly onDestroy = new Subject<void>()
  private readonly instanceNum = ++SearchListModalComponent.INSTANCE_COUNTER

  private _focusIndex = -1

  constructor(
    private readonly elementRef: ElementRef,
    @Inject(MODAL_DATA) readonly data: SearchListModalData,
    @Inject(MODAL_REF) readonly ref: ModalRef<SearchFilterOption>,
  ) {
    this.filteredGroups$ = this.searchCtrl.valueChanges.pipe(
      map((searchQuery) => (searchQuery ? searchQuery.trim() : null)),
      startWith(null),
      tap(() => (this._focusIndex = -1)),
      distinctUntilChanged(),
      map(this.filterOptions),
      shareReplay(1),
    )
  }

  ngAfterViewInit() {
    this.inputFieldRef.nativeElement.focus()
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  /**
   * if a link or button was hit by enter, close the modal
   */
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.code === 'Enter' && !hasModifierKey(event)) {
      if (event.target === this.inputFieldRef.nativeElement) {
        // use first option from filtered groups
        this.options.toArray()[0].select()
      }
    } else if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
      if (this.options && this.options.length) {
        event.preventDefault()
        const ix = this._focusIndex + (event.keyCode === DOWN_ARROW ? 1 : -1)
        if (ix === -1 || ix === this.options.length) {
          this._focusIndex = -1
          // focus input
          this.inputFieldRef?.nativeElement.focus()
        } else {
          this._focusIndex = ix >= 0 ? ix : this.options.length - 1
          // focus option
          this.options.toArray()[ix].focus()
        }
      }
    } else if (event.code === 'Escape') {
      this.ref.close({ focusSelf: true, result: undefined })
    }
  }

  onOptionSelected(event: OptionSelectionChange) {
    const result = <SearchFilterOption>event.source.value
    this.ref.close({ result, focusSelf: true })
  }

  private filterOptions = (query: string): SearchFilterOptionGroup[] => {
    if (query) {
      return this.data.groups
        .map((group) => ({ label: group.label, options: filterGeoNames(group.options, query) }))
        .filter((group) => group.options.length > 0)
    }
    return this.data.groups
  }
}

export const filterGeoNames = (options: SearchFilterOption[], query: string): SearchFilterOption[] => {
  const filterValue = normalizeString(query)
  return options.filter(
    (item) =>
      normalizeString(item.label).includes(filterValue) ||
      normalizeString(item.value?.toString()).includes(filterValue),
  )
}
