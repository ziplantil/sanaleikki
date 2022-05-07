

import Game, { GameMedium, ScoreTable, PlayerEnteredWords, MAXIMUM_WORDS, MAXIMUM_PLAYERS } from '../common/game'
import Options from '../common/options'
import SanaleikkiGameServer from './gameserver'
import * as fs from 'fs'

interface SanaleikkiPlayer {
  uuid: string;
  nick: string;
}

const words = fs.readFileSync('public/sanat.txt', 'utf8').split(/\r?\n/).filter(word => word)

export default class SanaleikkiGame implements GameMedium {
  private game: Game | null
  private server: SanaleikkiGameServer
  private options: Options
  private host: string
  private players: SanaleikkiPlayer[]
  private quitPlayers: Set<string>
  private submitted: Map<string, string[]>
  private endRoundTimeout: NodeJS.Timeout | null = null
  private roundOngoing = false

  constructor(server: SanaleikkiGameServer, uuid: string, nick: string,
              options: Options) {
    this.server = server
    this.options = options
    this.game = null
    this.host = uuid
    this.players = [{uuid, nick}]
    this.quitPlayers = new Set<string>()
    this.submitted = new Map<string, string[]>()
  }

  getOptions(): Options {
    return this.options
  }

  getPlayers(): string[] {
    return this.players.map(player => player.nick)
  }

  acceptsNewPlayers(): boolean {
    return !this.game
  }

  updatePlayers(uuid: string | null): void {
    const data = this.getPlayers()
    this.players.forEach(player => player.uuid === uuid
      || this.server.sendPlayers(player.uuid, data))
  }

  join(uuid: string, nick: string): void {
    if (this.game)
      throw "Peli on jo alkanut"
    if (this.players.length === MAXIMUM_PLAYERS)
      throw "Peli on jo täynnä"
    if (this.players.find(player => player.nick === nick))
      throw "Nimimerkki varattu"
    this.players.push({uuid, nick})
    this.updatePlayers(uuid)
  }

  submit(uuid: string, words: string[]): void {
    if (!this.submitted.has(uuid)) {
      this.submitted.set(uuid, words)
      if (words.length === MAXIMUM_WORDS)
        this.timeout()
    }
    if (this.submitted.size === this.players.length)
      this.endRound()
  }

  nextRound(uuid: string, roundNumber: number): void {
    if (uuid !== this.host) return
    if (this.roundOngoing) return
    this.roundOngoing = true
    this.submitted.clear()
    this.quitPlayers.forEach(uuid => this.submitted.set(uuid, []))
    if (!this.game) {
      if (roundNumber !== 0) return
      this.game = new Game(this, this.options)
    } else if (roundNumber !== this.game.getRoundNumber()) {
      return
    }

    const letters = this.game.startRound(3100) // 3 seconds for start of round, 100 ms for buffer
    if (!letters.length) {
      this.players.forEach(player => this.server.endOfGame(player.uuid))
    } else {
      this.players.forEach(player => this.server.sendAlarm(player.uuid, roundNumber + 1))
      setTimeout(() => this.players.forEach(player => this.server.sendLetters(player.uuid, letters, roundNumber + 1)), 3000)
    }
  }

  quit(uuid: string): boolean {
    if (this.game) {
      this.quitPlayers.add(uuid)
      this.submitted.set(uuid, [])
    } else {
      this.players = this.players.filter(player => player.uuid !== uuid)
      this.updatePlayers(null)
    }
    if (uuid === this.host) {
      const remainingPlayers = this.players.filter(player => !this.quitPlayers.has(player.uuid))
      if (!remainingPlayers.length) {
        return false
      }
      this.host = remainingPlayers[0].uuid
      this.server.youAreNowTheHost(this.host)
    }
    return true
  }

  initializeScores(): ScoreTable {
    return Object.fromEntries(this.players.map(player => [player.nick, 0]))
  }

  endRound(): void {
    if (this.endRoundTimeout !== null) {
      clearTimeout(this.endRoundTimeout)
      this.endRoundTimeout = null
    }
    if (!this.roundOngoing) return
    this.roundOngoing = false
    this.game!.endRound(Object.fromEntries(this.players.map(player =>
      [player.nick, this.submitted.get(player.uuid) || []])))
  }

  roundResults(words: PlayerEnteredWords, scores: ScoreTable): void {
    this.players.forEach(player =>
      this.server.sendRoundResults(player.uuid, words, scores))
  }

  timeout(): void {
    this.players.forEach(player => this.server.endOfRound(player.uuid))
    this.endRoundTimeout = setTimeout(() => this.endRound(), 15000)
  }

  getWordList(): string[] {
    return words
  }
}
