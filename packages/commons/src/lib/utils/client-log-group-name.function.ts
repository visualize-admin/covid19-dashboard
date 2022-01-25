export function createClientLogGroupName(stage: string): string {
  return `/bag-covid19-dashboard/${stage}/client`
}
