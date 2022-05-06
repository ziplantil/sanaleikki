import jwt from "jsonwebtoken"
import { cleanUpPlayerName, isValidPlayerName, PlayerEnteredWords, ScoreTable } from "../common/game"
import Options, { validateOptions } from "../common/options"
import SanaleikkiGame from "./game"

const JWT_SECRET = process.env.JWT_SECRET || ''

function newGameCode(codeLength: number): string {
  return [...Array(codeLength).keys()].map(() => String((Math.random() * 10) | 0)).join("")
}

const sendData = (socket: any, data: any) => {
  socket.send(JSON.stringify(data))
}

export default class SanaleikkiGameServer {
  games: Map<string, SanaleikkiGame> = new Map<string, SanaleikkiGame>()
  uuidInGame: Map<string, string> = new Map<string, string>()
  uuidToSocket: Map<string, any> = new Map<string, any>()

  message(socket: any, dataString: any): void {
    let data
    try {
      data = JSON.parse(dataString)
    } catch (e) {
      return
    }
    if (typeof data !== 'object') return
    const uuid = socket.uuid
    if (!this.uuidToSocket.has(uuid)) {
      this.uuidToSocket.set(uuid, socket)
    }
    const token = data["token"]
    const type = data["type"]
    if (!token) {
      let nick = data["nick"]
      if (!isValidPlayerName(nick)) {
        sendData(socket, {
          "type": "error",
          "error": "Nimimerkki ei kelpaa",
        })
        return
      }
      nick = cleanUpPlayerName(nick)
      
      if (type === "start") {
        const codeLength = Math.max(4, Math.ceil(1.8 + (this.games.size ? Math.log10(this.games.size) : 0)))
        let code
        do {
          code = newGameCode(codeLength)
        } while (this.games.has(code))

        const options: Options = { ...new Options(), ...data["options"] }
        if (!validateOptions(options)) {
          sendData(socket, {
            "type": "error",
            "error": "Asetukset eivät kelpaa",
          })
          return
        }

        let game: SanaleikkiGame
        try {
          game = new SanaleikkiGame(this, uuid, nick, options)
          this.games.set(code, game)
        } catch (e) {
          sendData(socket, {
            "type": "error",
            "error": String(e),
          })
          return
        }

        this.uuidInGame.set(uuid, code)
        sendData(socket, {
          "type": "joined",
          "code": code,
          "options": game.getOptions(),
          "players": game.getPlayers(),
          "token": jwt.sign(uuid, JWT_SECRET),
        })
      } else if (type === "join") {
        const code = data["code"]
        if (!this.games.has(code)) {
          sendData(socket, {
            "type": "error",
            "error": "Peliä ei löytynyt",
          })
          return
        }

        const game: SanaleikkiGame = this.games.get(code)!
        if (!game.acceptsNewPlayers()) {
          sendData(socket, {
            "type": "error",
            "error": "Peli on jo käynnissä, eikä siihen voi enää liittyä",
          })
          return
        }

        try {
          game.join(uuid, nick)
        } catch (e) {
          sendData(socket, {
            "type": "error",
            "error": String(e),
          })
          return
        }
        this.uuidInGame.set(uuid, code)
        sendData(socket, {
          "type": "joined",
          "code": code,
          "options": game.getOptions(),
          "players": game.getPlayers(),
          "token": jwt.sign(uuid, JWT_SECRET),
        })
      }
      return
    }
    
    const tokenId = jwt.verify(token, JWT_SECRET)
    if (tokenId !== uuid) return
    const gameId = this.uuidInGame.get(uuid)
    if (!gameId) return
    const game = this.games.get(gameId)
    if (!game) return

    if (type === "words" && Array.isArray(data["data"])) {
      try {
        game.submit(uuid, data["data"])
      } catch (e) {
        sendData(socket, {
          "type": "error",
          "error": String(e),
        })
        return
      }
    } else if (type === "next") {
      try {
        game.nextRound(uuid, data["round"] || 0)
      } catch (e) {
        sendData(socket, {
          "type": "error",
          "error": String(e),
        })
        return
      }
    }
  }

  quit(uuid: string): void {
    if (this.uuidInGame.has(uuid)) {
      const code = this.uuidInGame.get(uuid)!
      const game = this.games.get(code)
      if (game) {
        const continueGame = game.quit(uuid)
        if (!continueGame) {
          this.games.delete(code)
        }
      }
    }
    this.uuidInGame.delete(uuid)
    this.uuidToSocket.delete(uuid)
  }

  send(uuid: string, data: any): void {
    const socket: any = this.uuidToSocket.get(uuid)
    if (socket) sendData(socket, data)
  }

  sendPlayers(uuid: string, players: string[]): void {
    this.send(uuid, {
      "type": "players",
      "players": players,
    })
  }

  sendLetters(uuid: string, letters: string[], roundNum: number): void {
    this.send(uuid, {
      "type": "round",
      "letters": letters,
      "round": roundNum,
    })
  }

  sendRoundResults(uuid: string, words: PlayerEnteredWords, scores: ScoreTable): void {
    this.send(uuid, {
      "type": "result",
      "words": words,
      "scores": scores,
    })
  }

  youAreNowTheHost(uuid: string): void {
    this.send(uuid, { "type": "host" })
  }

  endOfRound(uuid: string): void {
    this.send(uuid, { "type": "call" })
  }

  endOfGame(uuid: string): void {
    this.send(uuid, { "type": "finish" })
  }
}
