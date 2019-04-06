import Koa from 'koa'
import koaBody from 'koa-body'
import { scheduleJob } from 'node-schedule'

import bot from './bot'
import db from './db'
import check from './check'

const port = 8001
const app = new Koa()

app.context.db = db

app.use(koaBody())
app.use(bot)
app.listen(port)

scheduleJob('*/3 * * * *', async function () {
  console.log('start', new Date)
  const servers = db.get('users').flatMap('servers')
  for (let server of servers) {
    await check(server)
  }

  db.write()
  console.log('finish', new Date)
})

export default app
