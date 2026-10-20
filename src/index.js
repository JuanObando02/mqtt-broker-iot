const net = require('net')
const http = require('http')
const ws = require('websocket-stream')
const Aedes = require('aedes')

const MQTT_PORT = Number(process.env.MQTT_PORT || 1883)
const WS_PORT = Number(process.env.WS_PORT || 8883)
const MQTT_USER = process.env.MQTT_USER
const MQTT_PASS = process.env.MQTT_PASS

function main () {
  const aedes = Aedes()

  // Si defines MQTT_USER y MQTT_PASS se exige autenticacion; si no, es anonimo (para clase)
  if (MQTT_USER && MQTT_PASS) {
    aedes.authenticate = (client, username, password, cb) => {
      const ok = username === MQTT_USER && password && password.toString() === MQTT_PASS
      cb(ok ? null : Object.assign(new Error('Auth failed'), { returnCode: 4 }), ok)
    }
  }

  aedes.on('client', c => console.log(`[+] cliente conectado: ${c.id}`))
  aedes.on('clientDisconnect', c => console.log(`[-] cliente desconectado: ${c.id}`))
  aedes.on('subscribe', (subs, c) => console.log(`[sub] ${c.id}: ${subs.map(s => s.topic).join(', ')}`))
  aedes.on('publish', (p, c) => {
    if (c) console.log(`[pub] ${c.id} -> ${p.topic}: ${p.payload.toString().slice(0, 200)}`)
  })

  const tcp = net.createServer(aedes.handle)
  tcp.listen(MQTT_PORT, () => console.log(`MQTT TCP escuchando en :${MQTT_PORT}`))

  // WebSocket (para clientes web / navegador) + health check HTTP en la misma ruta
  const httpServer = http.createServer((req, res) => {
    res.end('MQTT broker OK\n')
  })
  ws.createServer({ server: httpServer }, aedes.handle)
  httpServer.listen(WS_PORT, () => console.log(`MQTT WebSocket escuchando en :${WS_PORT}`))

  const shutdown = () => {
    console.log('Cerrando...')
    tcp.close()
    httpServer.close()
    aedes.close(() => process.exit(0))
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main()
