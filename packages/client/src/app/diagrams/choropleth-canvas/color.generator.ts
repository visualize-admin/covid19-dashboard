// tslint:disable:no-bitwise

export function* colorGenerator() {
  let nextCol = 1

  while (nextCol < 16777215) {
    yield `rgb(${nextCol & 0xff},${(nextCol & 0xff00) >> 8},${(nextCol & 0xff0000) >> 16})`
    nextCol += 100
  }
}
