const inclusiveScan = (array: number[]): number[] => {
  const scan = Array(array.length)
  let sum = 0
  for (let i = 0; i < array.length; ++i) {
    sum += array[i]
    scan[i] = sum
  }
  return scan
}

export default class RandomSource {
  randomFloat(): number {
    return Math.random()
  }

  randomInteger(minimum: number, maximum: number): number {
    return minimum + 0 | (this.randomFloat() * (maximum - minimum + 1))
  }

  randomIndex(length: number): number {
    return 0 | (this.randomFloat() * length)
  }

  randomIndexWithBase(base: number, length: number): number {
    return 0 | (this.randomFloat() * (length - base)) + base
  }

  pickCharacter(options: string): string {
    return options[this.randomIndex(options.length)]
  }

  pickItem<Type>(options: Type[]): Type {
    return options[this.randomIndex(options.length)]
  }

  pickFromDistribution(options: {[key: string]: number}): string {
    const choices = [...Object.keys(options)]
    const counts = choices.map(choice => options[choice])
    const scan = inclusiveScan(counts)
    const roll = this.randomFloat() * scan[scan.length - 1]

    // I could binary search this but it wouldn't matter too much
    let index = 0
    while (roll >= scan[index]) ++index
    return choices[index]
  }

  shuffle(list: any[]): void {
    const n = list.length
    for (let i = 0; i < n - 1; ++i) {
      const j = this.randomIndexWithBase(i, n)
      if (i != j)
        [list[i], list[j]] = [list[j], list[i]]
    }
  }
}
