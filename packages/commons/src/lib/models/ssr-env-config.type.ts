export interface SrrEnvConfig {
  apiAuth: string
  common: {
    stage: string
    region: string
    productionFlag: boolean
    pullRequestFlag: boolean
  }
}
