import { ScoreTable, PlayerEnteredWords } from '../../common/game'
import GameProxy from './gameproxy'
import Options from '../../common/options'

export interface GameMultiCallbacks {
  updateOptions: (options: Options) => void;
  updatePlayers: (players: string[]) => void;
  updateScores: (score: ScoreTable) => void;
  shareCode: (code: string) => void;
  isNowTheHost: () => void;
  gotCall: () => void;
  roundResults: (words: PlayerEnteredWords, score: ScoreTable) => void;
  roundStart: (roundNum: number) => void;
  gameError: (error: string) => void;
  gameOver: () => void;
}

const defaultWebSocketError = code => {
  switch (code) {
    case 1001: return "Asiakas sulki yhteyden"
    case 1002: return "Virheellinen tietokehys"
    case 1003: return "Tietokehystä ei tueta"
    case 1005: return "Ei sulkemistietoa"
    case 1006: return "Odottamaton katkaisu"
    case 1007: return "Virheellinen sanoma"
    case 1008: return "Yhteyskäytäntövirhe"
    case 1009: return "Tietokehys liian suuri"
    case 1010: return "Liitännäistä ei tueta"
    case 1011: return "Palvelinvirhe"
    case 1012: return "Uudelleenkäynnistys"
    case 1013: return "Väliaikainen vika"
    case 1014: return "Virheellinen yhdyskäytävä"
    case 1015: return "Salausyhteyden muodostus epäonnistui"
    default:   return "Tuntematon virhe"
  }
}

export default class GameMulti implements GameProxy {
  private ws: WebSocket
  private options: Options
  private nick: string
  private code: string
  private callbacks: GameMultiCallbacks
  private token: string
  private host: boolean
  private letters: string[]
  private roundCallback: (letters: string[]) => void
  private failure = false
  private finalized = false

  constructor(options: Options, nick: string, code: string | null, callbacks: GameMultiCallbacks) {
    this.options = options
    this.nick = nick
    this.code = code
    this.callbacks = callbacks
    this.host = code === null
    this.roundCallback = null

    const wsproto = document.location.protocol.replace('http', 'ws')
    let port = document.location.port
    if (port) {
      port = `:${port}`
    }
    this.ws = new WebSocket(`${wsproto}//${document.location.hostname}${port}${document.location.pathname}`)

    this.ws.addEventListener('open', () => this.onSocketOpen())
    this.ws.addEventListener('close', e => this.onSocketClose(e))
    this.ws.addEventListener('error', e => this.onSocketError(e))
    this.ws.addEventListener('message', e => this.receive(e.data))
  }

  nextRound(round: number): void {
    this.letters = null
    this.send({
      "token": this.token,
      "type": "next",
      "round": round
    })
  }

  startRound(callback: (letters: string[]) => void): void {
    if (this.roundCallback) return
    this.roundCallback = callback
    if (this.letters) {
      callback(this.letters)
    }
  }

  endRound(words: string[]): void {
    this.letters = null
    this.send({
      "token": this.token,
      "type": "words",
      "data": words
    })
  }

  isHost(): boolean {
    return this.host
  }

  send(data: any): void {
    this.ws.send(JSON.stringify(data))
  }

  receive(dataString: string): void {
    let data
    try {
      data = JSON.parse(dataString)
    } catch (e) {
      return
    }
    const type = data["type"]
    if (type === "error") {
      this.onSocketError(data["error"] || "Tuntematon virhe")
    } else if (type === "joined") {
      const code = data["code"]
      if (!this.code)
        this.callbacks.shareCode(code)
      this.code = code
      this.token = data["token"]
      if (!this.host) {
        this.options = data["options"]
        this.callbacks.updateOptions(this.options)
      }
      this.callbacks.updatePlayers(data["players"])
    } else if (type === "players") {
      this.callbacks.updatePlayers(data["players"])
    } else if (type === "round") {
      const letters = data["letters"]
      this.letters = letters
      if (this.roundCallback) {
        this.roundCallback(letters)
        this.roundCallback = null
      }
      this.callbacks.roundStart(data["round"])
    } else if (type === "result") {
      this.callbacks.roundResults(data["words"], data["scores"])
    } else if (type === "host") {
      this.host = true
      this.callbacks.isNowTheHost()
    } else if (type === "call") {
      this.callbacks.gotCall()
    } else if (type === "finish") {
      this.finalize()
      this.ws.close()
      this.callbacks.gameOver()
    }
  }

  onSocketOpen(): void {
    if (!this.code) {
      this.send({
        "type": "start",
        "nick": this.nick,
        "options": this.options
      })
    } else {
      this.send({
        "type": "join",
        "nick": this.nick,
        "code": this.code
      })
    }
  }

  onSocketError(event: Event): void {
    if (this.finalized) return
    this.failure = true
    this.callbacks.gameError(String(event))
  }

  onSocketClose(event: CloseEvent): void {
    if (this.finalized || event.code === 1001)
      return
    else if (event.code !== 1000 && !this.failure)
      this.callbacks.gameError(`WebSocket-virhe ${event.code}: ${event.reason || defaultWebSocketError(event.code)}`)
    else
      this.callbacks.gameOver()
  }

  finalize(): void {
    this.finalized = true
  }
}
