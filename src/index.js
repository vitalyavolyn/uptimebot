import Koa from 'koa'
import koaBody from 'koa-body'
import { scheduleJob } from 'node-schedule'

import bot from './bot'
import db from './db'
import check from './check'

const app = new Koa()

app.context.db = db

app.use(koaBody())
app.use(bot)
app.listen(process.env.PORT || 8001)

scheduleJob('*/3 * * * *', async function () {
  const servers = db.get('users').flatMap('servers')
  for (let server of servers) {
    await check(server)
  }

  db.write()
})

export default app
