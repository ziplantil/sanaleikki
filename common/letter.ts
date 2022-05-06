export const EASY_VOWELS = 'AEIOU'
export const HARD_VOWELS = 'YÄÖ'
export const VOWELS = EASY_VOWELS + HARD_VOWELS
export const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXZ'
export const LETTERS = VOWELS + CONSONANTS
export const LETTER_REGEX = new RegExp('[' + LETTERS + ']', 'g')
export const LETTER_NOT_REGEX = new RegExp('[^' + LETTERS + ']', 'g')
export const EASY_VOWEL_REGEX = new RegExp('[' + EASY_VOWELS + ']', 'g')
export const HARD_VOWEL_REGEX = new RegExp('[' + HARD_VOWELS + ']', 'g')
export const VOWEL_REGEX = new RegExp('[' + VOWELS + ']', 'g')
export const CONSONANT_REGEX = new RegExp('[' + CONSONANTS + ']', 'g')
export const NOT_EASY_VOWEL_REGEX = new RegExp('[^' + EASY_VOWELS + ']', 'g')
export const NOT_HARD_VOWEL_REGEX = new RegExp('[^' + HARD_VOWELS + ']', 'g')
export const NOT_VOWEL_REGEX = new RegExp('[^' + VOWELS + ']', 'g')
export const NOT_CONSONANT_REGEX = new RegExp('[^' + CONSONANTS + ']', 'g')

export const LETTER_ORDER = 'AIEOUÄÖYKPSTMNLRJHVDBCFGQWXZ'

export function isVowel(letter: string) : boolean {
  return letter.length === 1 && VOWELS.includes(letter.toUpperCase())
}

export function isEasyVowel(letter: string) : boolean {
  return letter.length === 1 && EASY_VOWELS.includes(letter.toUpperCase())
}

export function isConsonant(letter: string) : boolean {
  return letter.length === 1 && CONSONANTS.includes(letter.toUpperCase())
}

export function isValidLetter(letter: string) : boolean {
  return letter.length === 1 && LETTERS.includes(letter.toUpperCase())
}
