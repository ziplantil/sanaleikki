import WebSocket from 'ws'
import SanaleikkiGameServer from './gameserver'
import { v4 as uuidv4 } from 'uuid'

type ClientSocket = WebSocket.WebSocket & { isAlive: boolean, uuid: string }

const game: SanaleikkiGameServer = new SanaleikkiGameServer()

const usedUuids = new Set<string>()

function reserveUuid(): string {
  let uuid: string
  do {
    uuid = uuidv4()
  } while (usedUuids.has(uuid))
  usedUuids.add(uuid)
  return uuid
}

export function sanaleikkiConnectHandler(server: WebSocket.Server) {
  const noop = () => {}

  setInterval(function ping() {
    server.clients.forEach((sockUnder: WebSocket.WebSocket) => {
      const sock = sockUnder as ClientSocket
      if (!sock.uuid) return
      if (sock.isAlive === false) {
        console.log(`ping timeout: ${sock}`)
        game.quit(sock.uuid)
        usedUuids.delete(sock.uuid)
        return sock.terminate()
      }
      sock.isAlive = false
      sock.ping(noop)
    })
  }, 10000)

  return (sock: ClientSocket) => {
    const uuid = reserveUuid()
    sock.uuid = uuid
    sock.isAlive = true
    sock.on('pong', () => { sock.isAlive = true })
    sock.on('close', () => {
      game.quit(uuid)
      usedUuids.delete(uuid)
    })
    sock.on('message', (data) => game.message(sock, data))
  }
}
