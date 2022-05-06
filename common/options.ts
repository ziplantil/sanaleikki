import Difficulty from './difficulty'

export function validateOptions(options: Options): boolean {
  if (options.difficulty !== Difficulty.Easy
      && options.difficulty !== Difficulty.Medium
      && options.difficulty !== Difficulty.Hard) {
    return false
  }
  if (options.roundTime < 1 || options.roundTime >= 3600) {
    return false
  }
  if (options.rounds < 1 || options.rounds > 10) {
    return false
  }
  if (options.minimumWordLength < 4 || options.minimumWordLength > 5) {
    return false
  }
  return true
}

export default class Options {
  difficulty: Difficulty = Difficulty.Medium
  roundTime = 300
  rounds = 1
  minimumWordLength = 4
  penalties = true
}
