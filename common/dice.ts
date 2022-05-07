
import Difficulty from './difficulty'
import { isConsonant, isVowel, isEasyVowel, VOWEL_REGEX, EASY_VOWEL_REGEX, HARD_VOWEL_REGEX, CONSONANT_REGEX } from './letter'
import Options from './options'
import RandomSource from './random'

export enum DiceType {
  Classic,
  Modern
}

export interface SanaleikkiDice {
  readonly count: number;
  generate(random: RandomSource): string[];
}

export class ClassicSanaleikkiDice implements SanaleikkiDice {
  private difficulty: Difficulty
  readonly count: number = 9

  constructor(difficulty: Difficulty) {
    this.difficulty = difficulty
  }

  generate(random: RandomSource): string[] {
    type DiceRoll = [string, string]

    const firstRoll = (options: string): DiceRoll => [random.pickCharacter(options), options]
    const reroll = (roll: DiceRoll): DiceRoll => firstRoll(roll[1])
    const firstRerollableIndex = (rolls: DiceRoll[], 
                                  fn: (letter: string) => boolean,
                                  regex: RegExp): DiceRoll =>
      rolls.find(roll => fn(roll[0]) && roll[1].match(regex))!
    const rerollOf = (roll: DiceRoll, regex: RegExp): DiceRoll =>
      firstRoll([...roll[1].matchAll(regex)].map(match => match[0]).join(""))

    //const dice = ["AEVTLY", "AENLMO", "ASKÄET", "AÄNEMU", "IVNÄOS", "IÖTKNS", "IPAKSO", "ITLUHA", "IJTNUR"];
    const dice = ["TAUHIL", "KOPSIA", "IJTNRU", "ENLAOM", "VYLATE", "EMÄUNA", "KSAÄTE", "NOSIVÄ", "KIÖTSM"]
    switch (this.difficulty) {
      case Difficulty.Easy:
      {
        // vowel count must be 4-5, no front vowels, at least one A or I
        let diceRolls = dice.map(options => firstRoll(options.replace(HARD_VOWEL_REGEX, '')))

        // >= 3 of any letter
        const mostCommon = diceRolls.sort((a, b) => 
          diceRolls.filter(v => v[0] === b[0]).length - diceRolls.filter(v => v[0] === a[0]).length)[0][0]
        if (diceRolls.filter(([roll]) => roll === mostCommon).length >= 3)
          diceRolls = dice.map(options => firstRoll(options.replace(HARD_VOWEL_REGEX, '')))

        // too many E's
        const eCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => letter.toLowerCase() === 'e').length
        if (eCount >= 2) {
          diceRolls = diceRolls.map(roll =>
            roll[0].toLowerCase() === 'e' ? reroll(roll) : roll)
        }

        // vowel count
        let vowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => isVowel(letter)).length

        while (vowelCount < 4) {
          // reroll random die that landed on a consonant
          const roll = firstRerollableIndex(diceRolls, isConsonant, EASY_VOWEL_REGEX)
          roll[0] = rerollOf(roll, EASY_VOWEL_REGEX)[0]
          ++vowelCount
        }
        while (vowelCount > 5) {
          // reroll random die that landed on a vowel
          const roll = firstRerollableIndex(diceRolls, isVowel, CONSONANT_REGEX)
          roll[0] = rerollOf(roll, CONSONANT_REGEX)[0]
          --vowelCount
        }

        // at least one A or I
        if (!diceRolls.
             map(([letter]) => letter).
             filter(letter => letter.match(/ai/ig)).length) {
          const roll = firstRerollableIndex(diceRolls, isVowel, /[ai]/gi)
          roll[0] = rerollOf(roll, /[ai]/gi)[0]
        }

        return diceRolls.map(roll => roll[0])
      }
      case Difficulty.Medium:
      {
        // allow as few as 3 and as many as 6 vowels
        let diceRolls = dice.map(options => firstRoll(options))
        let vowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => isVowel(letter)).length
        if (vowelCount <= 3 || vowelCount >= 6)
          diceRolls = dice.map(options => firstRoll(options.replace(HARD_VOWEL_REGEX, '')))

        // >= 3 of any letter
        const mostCommon = diceRolls.sort((a, b) => 
          diceRolls.filter(v => v[0] === b[0]).length - diceRolls.filter(v => v[0] === a[0]).length)[0][0]
        if (Math.random() < 0.75 && diceRolls.filter(([roll]) => roll === mostCommon).length >= 3)
          diceRolls = dice.map(options => firstRoll(options.replace(HARD_VOWEL_REGEX, '')))

        // too
        // too many E's
        const eCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => letter.toLowerCase() === 'e').length
        if (Math.random() < 0.75 && eCount > 2) {
          diceRolls = diceRolls.map(roll =>
            roll[0].toLowerCase() === 'e' ? reroll(roll) : roll)
        }

        // vowel count
        vowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => isVowel(letter)).length
        while (vowelCount < 3) {
          // reroll random die that landed on a consonant
          const roll = firstRerollableIndex(diceRolls, isConsonant, VOWEL_REGEX)
          roll[0] = rerollOf(roll, VOWEL_REGEX)[0]
          ++vowelCount
        }

        const backVowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => letter.match(/[aou]/i)).length
        const frontVowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => letter.match(/[äöy]/i)).length
        const neutralVowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => letter.match(/[ie]/i)).length
        
        if (frontVowelCount >= neutralVowelCount && backVowelCount > neutralVowelCount) {
          // reroll front vowels to something else than back vowels
          diceRolls = diceRolls.map(roll =>
            roll[0].match(/[äöy]/i) ? rerollOf(roll, /[^äöy]/gi) : roll)

          let vowelCount = diceRolls.
            map(([letter]) => letter).
            filter(letter => isVowel(letter)).length
          while (vowelCount < 3) {
            // reroll random die that landed on a consonant
            const roll = firstRerollableIndex(diceRolls, isConsonant, EASY_VOWEL_REGEX)
            roll[0] = rerollOf(roll, EASY_VOWEL_REGEX)[0]
            ++vowelCount
          }
        }
        
        while (vowelCount > 6) {
          // reroll random die that landed on a vowel
          const roll = firstRerollableIndex(diceRolls, isVowel, CONSONANT_REGEX)
          roll[0] = rerollOf(roll, CONSONANT_REGEX)[0]
          --vowelCount
        }
        return diceRolls.map(roll => roll[0])
      }
      case Difficulty.Hard:
      {
        let vowelCount
        let diceRolls
        do {
          diceRolls = dice.map(options => firstRoll(options))
          vowelCount = diceRolls.
            map(([letter]) => letter).
            filter(letter => isVowel(letter)).length
        } while (vowelCount < 2 || vowelCount > 7)
        return diceRolls.map(roll => roll[0])
      }
    }
  }
}

export class ModernSanaleikkiDice implements SanaleikkiDice {
  private difficulty: Difficulty
  readonly count: number = 9

  constructor(difficulty: Difficulty) {
    this.difficulty = difficulty
  }

  generate(random: RandomSource): string[] {
    const vowelMultiplier = 1.07387676
    const vowelCounts: {[letter: string]: number} = {
      "A": 457350,
      "I": 421366,
      "E": 323087,
      "O": 208923,
      "U": 196678,
      "Ä": 189134,
      "Y": 71316
    }
    const consonantCounts: {[letter: string]: number} = {
      "T": 388711,
      "N": 341181,
      "S": 309350,
      "L": 226627,
      "K": 207520,
      "M": 137972,
      "V": 96316,
      "R": 85116,
      "J": 75961,
      "H": 71733,
      "P": 65358,
    }
    
    switch (this.difficulty) {
      case Difficulty.Easy:
      {
        const vowelCount = random.randomInteger(4, 5)
        const easyVowelCounts = Object.fromEntries([...Object.keys(vowelCounts)].filter(isEasyVowel).map(vowel => [vowel, vowelCounts[vowel]]))
        const vowelRun = [...Array(vowelCount)].map(() => random.pickFromDistribution(easyVowelCounts))
        const consonantRun = [...Array(this.count - vowelCount)].map(() => random.pickFromDistribution(consonantCounts))
        return [ ...vowelRun, ...consonantRun ]
      }
      case Difficulty.Medium:
      {
        const vowelCount = random.randomInteger(3, 6)
        const vowelRun = [...Array(vowelCount)].map(() => random.pickFromDistribution(vowelCounts))
        const consonantRun = [...Array(this.count - vowelCount)].map(() => random.pickFromDistribution(consonantCounts))
        return [ ...vowelRun, ...consonantRun ]
      }
      case Difficulty.Hard:
      {
        const combinedCounts = { ...Object.fromEntries([...Object.keys(vowelCounts)].map(vowel => [vowel, vowelCounts[vowel] * vowelMultiplier])),
                                 ...consonantCounts }
        let diceRolls = [...Array(this.count)].map(() => random.pickFromDistribution(combinedCounts))
        const vowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => isVowel(letter)).length
        if (vowelCount < 2 || vowelCount > 7) {
          const vowelCount = random.randomInteger(2, 7)
          const vowelRun = [...Array(vowelCount)].map(() => random.pickFromDistribution(vowelCounts))
          const consonantRun = [...Array(this.count - vowelCount)].map(() => random.pickFromDistribution(consonantCounts))
          diceRolls = [ ...vowelRun, ...consonantRun ]
        }
        return diceRolls
      }
    }
  }
}

export function getDice(options: Options) : SanaleikkiDice {
  switch (options.diceType) {
    case DiceType.Classic:
      return new ClassicSanaleikkiDice(options.difficulty)
    case DiceType.Modern:
      return new ModernSanaleikkiDice(options.difficulty)
  }
}
