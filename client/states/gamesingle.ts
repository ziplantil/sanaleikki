import Game, { GameMedium, ScoreTable, PlayerEnteredWords } from '../../common/game'
import GameProxy from './gameproxy'
import Options from '../../common/options'

const PLAYER = ''

export interface GameSingleCallbacks {
  roundResults: (words: PlayerEnteredWords, score: ScoreTable) => void;
}

export default class GameSingle implements GameMedium, GameProxy {
  private game: Game
  private options: Options
  private words: string[]
  private callbacks: GameSingleCallbacks

  constructor(options: Options, words: string[], callbacks: GameSingleCallbacks) {
    this.options = options
    this.words = words
    this.callbacks = callbacks
    this.game = new Game(this, options)
  }

  initializeScores(): ScoreTable {
    return {[PLAYER]: 0}
  }

  roundResults(words: PlayerEnteredWords, scores: ScoreTable): void {
    this.callbacks.roundResults(words, scores)
  }

  timeout(): void { }

  getWordList(): string[] {
    return this.words
  }

  nextRound(): void { }

  startRound(callback: (letters: string[]) => void): void {
    callback(this.game.startRound())
  }

  endRound(words: string[]): void {
    this.game.endRound({[PLAYER]: words})
  }

  finalize(): void { }

  isHost(): boolean {
    return true
  }
}
