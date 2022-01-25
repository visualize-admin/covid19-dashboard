export interface ClientConfig {
  logGroupName: string

  dataEndpoint: string

  iamAccessKeyId: string
  // that's ok. secretAccessKey for ClientAppUser containing the permission to send the necessary sns events
  iamSecretAccessKey: string

  /** date in format YYYY-MM-DD */
  showTechnicalIssueHintUntil: string

  common: {
    stage: string
    region: string
    productionFlag: boolean
    pullRequestFlag: boolean
  }
}
