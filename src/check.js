import axios from 'axios'
import ping from 'ping'
import vk from './vk'
import sugar from 'sugar-date'
import 'sugar-date/locales/ru'
import { checkPortStatus } from 'portscanner'

sugar.Date.setLocale('ru')

export default async function check (server, counter = 0) {
  let status
  if (server.type === 'http') {
    status = await axios(server.url, { timeout: 15 * 1000 }).then(() => true, (e) => false)
  } else if (server.type === 'ping') {
    let p = await ping.promise.probe(server.url.split('//')[1]) // убирает ping://
    status = p.alive
  } else {
    let [host, port] = server.url.split('//')[1].split(':')
    let check = await checkPortStatus(port, host)
    status = check === 'open'
  }

  if (!status && counter < 5) return check(server, counter + 1)

  server.lastCheck = new Date()
  if (typeof server.status !== 'boolean') {
    server.since = new Date()
  } else if (server.status && !status) {
    vk.api.messages.send({
      message: `${server.url} недоступен!`,
      peer_id: server.to,
      dont_parse_links: 1
    })
    server.since = new Date()
  } else if (!server.status && status) {
    vk.api.messages.send({
      message: `${server.url} снова доступен. Он был недоступен ${sugar.Date.relativeTo(new Date(), server.since)}`,
      peer_id: server.to,
      dont_parse_links: 1
    })
    server.since = new Date()
  }
  server.lastCheck = new Date()
  server.status = status

  return server
}
