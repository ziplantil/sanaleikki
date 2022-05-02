
import Difficulty from './difficulty';
import { isConsonant, isVowel, VOWEL_REGEX, EASY_VOWEL_REGEX, HARD_VOWEL_REGEX, CONSONANT_REGEX } from './letter';
import Options from './options';
import RandomSource from './random';

export interface SanaleikkiDice {
  readonly count: number;
  generate(random: RandomSource): string[];
}

export class ClassicSanaleikkiDice implements SanaleikkiDice {
  private difficulty: Difficulty;
  readonly count: number = 9;

  constructor(difficulty: Difficulty) {
    this.difficulty = difficulty;
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
    const dice = ["TAUHIL", "KOPSIA", "IJTNRU", "ENLAOM", "VYLATE", "EMÄUNA", "KSAÄTE", "NOSIVÄ", "KIÖTSM"];
    switch (this.difficulty) {
      case Difficulty.Easy:
      {
        // vowel count must be 4-5, no front vowels, at least one A or I
        let diceRolls = dice.map(options => firstRoll(options.replace(HARD_VOWEL_REGEX, '')));

        // >= 3 of any letter
        const mostCommon = diceRolls.sort((a, b) => 
          diceRolls.filter(v => v[0] === b[0]).length - diceRolls.filter(v => v[0] === a[0]).length)[0][0]
        if (diceRolls.filter(([roll]) => roll === mostCommon).length >= 3)
          diceRolls = dice.map(options => firstRoll(options.replace(HARD_VOWEL_REGEX, '')));

        // too many E's
        const eCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => letter.toLowerCase() === 'e').length;
        if (eCount >= 2) {
          diceRolls = diceRolls.map(roll =>
            roll[0].toLowerCase() === 'e' ? reroll(roll) : roll)
        }

        // vowel count
        let vowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => isVowel(letter)).length;

        while (vowelCount < 4) {
          // reroll random die that landed on a consonant
          const roll = firstRerollableIndex(diceRolls, isConsonant, EASY_VOWEL_REGEX);
          roll[0] = rerollOf(roll, EASY_VOWEL_REGEX)[0]
          ++vowelCount
        }
        while (vowelCount > 5) {
          // reroll random die that landed on a vowel
          const roll = firstRerollableIndex(diceRolls, isVowel, CONSONANT_REGEX);
          roll[0] = rerollOf(roll, CONSONANT_REGEX)[0]
          --vowelCount
        }

        // at least one A or I
        if (!diceRolls.
             map(([letter]) => letter).
             filter(letter => letter.match(/ai/ig)).length) {
          const roll = firstRerollableIndex(diceRolls, isVowel, /[ai]/gi);
          roll[0] = rerollOf(roll, /[ai]/gi)[0]
        }

        return diceRolls.map(roll => roll[0]);
      }
      case Difficulty.Medium:
      {
        // allow as few as 3 and as many as 6 vowels
        let diceRolls = dice.map(options => firstRoll(options));
        let vowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => isVowel(letter)).length;
        if (vowelCount <= 3 || vowelCount >= 6)
          diceRolls = dice.map(options => firstRoll(options.replace(HARD_VOWEL_REGEX, '')))

        // >= 3 of any letter
        const mostCommon = diceRolls.sort((a, b) => 
          diceRolls.filter(v => v[0] === b[0]).length - diceRolls.filter(v => v[0] === a[0]).length)[0][0]
        if (Math.random() < 0.75 && diceRolls.filter(([roll]) => roll === mostCommon).length >= 3)
          diceRolls = dice.map(options => firstRoll(options.replace(HARD_VOWEL_REGEX, '')));

        // too
        // too many E's
        const eCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => letter.toLowerCase() === 'e').length;
        if (Math.random() < 0.75 && eCount > 2) {
          diceRolls = diceRolls.map(roll =>
            roll[0].toLowerCase() === 'e' ? reroll(roll) : roll)
        }

        // vowel count
        vowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => isVowel(letter)).length;
        while (vowelCount < 3) {
          // reroll random die that landed on a consonant
          const roll = firstRerollableIndex(diceRolls, isConsonant, VOWEL_REGEX);
          roll[0] = rerollOf(roll, VOWEL_REGEX)[0]
          ++vowelCount
        }

        const backVowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => letter.match(/[aou]/i)).length;
        const frontVowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => letter.match(/[äöy]/i)).length;
        const neutralVowelCount = diceRolls.
          map(([letter]) => letter).
          filter(letter => letter.match(/[ie]/i)).length;
        
        if (frontVowelCount >= neutralVowelCount && backVowelCount > neutralVowelCount) {
          // reroll front vowels to something else than back vowels
          diceRolls = diceRolls.map(roll =>
            roll[0].match(/[äöy]/i) ? rerollOf(roll, /[^äöy]/gi) : roll)

          let vowelCount = diceRolls.
            map(([letter]) => letter).
            filter(letter => isVowel(letter)).length
          while (vowelCount < 3) {
            // reroll random die that landed on a consonant
            const roll = firstRerollableIndex(diceRolls, isConsonant, EASY_VOWEL_REGEX);
            roll[0] = rerollOf(roll, EASY_VOWEL_REGEX)[0]
            ++vowelCount
          }
        }
        
        while (vowelCount > 6) {
          // reroll random die that landed on a vowel
          const roll = firstRerollableIndex(diceRolls, isVowel, CONSONANT_REGEX);
          roll[0] = rerollOf(roll, CONSONANT_REGEX)[0]
          --vowelCount
        }
        return diceRolls.map(roll => roll[0]);
      }
      case Difficulty.Hard:
        return dice.map(options => random.pickCharacter(options));
    }
  }
}

export function getDice(options: Options) : SanaleikkiDice {
  return new ClassicSanaleikkiDice(options.difficulty);
}
