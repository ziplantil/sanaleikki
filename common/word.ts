import { LETTER_NOT_REGEX } from './letter'

export interface WordValidator {
  validate(word: string): boolean;
}

export class WordListValidator implements WordValidator {
  private set: Set<string>;
  constructor(list: string[]) {
    this.set = new Set<string>(list.map(word => word.trim().toUpperCase()).filter(word => !word.match(LETTER_NOT_REGEX)))
  }
  validate(word: string): boolean {
    return this.set.has(word.toUpperCase())
  }
}

function countLetters(word: string) : { [L: string]: number } {
  const result: { [L: string]: number } = {}
  for (const letter of word)
    result[letter] = 1 + (result[letter] || 0)
  return result
}

export function pointsForWord(word: string) {
  return word.length - 3
}

export class WordLetterValidator implements WordValidator {
  private letters: { [L: string]: number }
  constructor(letters: string[]) {
    this.letters = countLetters(letters.join(''))
  }
  validate(word: string): boolean {
    const wordLetters = countLetters(word)
    return Object.keys(wordLetters).every(letter => wordLetters[letter] <= (this.letters[letter] || 0))
  }
}
