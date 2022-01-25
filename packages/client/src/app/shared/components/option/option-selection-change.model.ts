import { OptionComponent } from './option.component'

/** Event object emitted by OptionComponent when selected or deselected. */
export class OptionSelectionChange {
  constructor(
    /** Reference to the option that emitted the event. */
    public source: OptionComponent,
    /** Whether the change in the option's value was a result of a user action. */
    public isUserInput = false,
  ) {}
}
