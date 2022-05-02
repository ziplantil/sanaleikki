export default class RandomSource {
  randomFloat(): number {
    return Math.random();
  }

  randomInteger(minimum: number, maximum: number): number {
    return minimum + 0 | (this.randomFloat() * (maximum - minimum + 1));
  }

  randomIndex(length: number): number {
    return 0 | (this.randomFloat() * length);
  }

  randomIndexWithBase(base: number, length: number): number {
    return 0 | (this.randomFloat() * (length - base)) + base;
  }

  pickCharacter(options: string): string {
    return options[this.randomIndex(options.length)];
  }

  pickItem<Type>(options: Type[]): Type {
    return options[this.randomIndex(options.length)];
  }

  shuffle(list: any[]): void {
    const n = list.length;
    for (let i = 0; i < n - 1; ++i) {
      const j = this.randomIndexWithBase(i, n);
      if (i != j)
        [list[i], list[j]] = [list[j], list[i]];
    }
  }
}
