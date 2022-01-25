export interface SearchFilterOptionGroup {
  label: string
  options: SearchFilterOption[]
}

export interface SearchFilterOption {
  value: string | number | null
  label: string
}
