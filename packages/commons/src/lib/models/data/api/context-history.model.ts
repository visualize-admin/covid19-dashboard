export interface ContextHistoryItem {
  date: string
  latest: boolean
  published: string
  dataVersion: string
  dataContextUrl: string
}

export interface DataVersionItem {
  date: string
  dataVersion: string
  published: string | null
  created: string | null
  previewUrl: string | null
  socialMediaPreviewUrl: string | null
}

export interface ContextHistoryRecord {
  dataVersion: string
  published: string
}

export const CONTEXT_HISTORY_FILE_NAME = 'history/context-history.json'
