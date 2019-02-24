import { sample } from 'lodash'

import vk from '../vk'
import txt from '../txt'
import db from '../db'
import { menu } from './shared/buttons'
import stickers from './stickers'

import * as add from './add'
import * as del from './del'
import list from './list'

const { updates } = vk
const stateMachine = new Map()

// вылавливаем всех неавторизованных
// а также добавляем несколько вещей в контекст
updates.on('message', async (ctx, next) => {
  const { peerId } = ctx

  ctx.db = db
  if (ctx.isFromUser) {
    let user = ctx.db.get('users').find({ id: peerId }).value()
    if (!user) {
      user = ctx.db.get('users').push({ id: peerId, servers: [] }).value()
      ctx.db.write()
    }
    ctx.state.user = user

    const { messagePayload } = ctx
    ctx.state.command = messagePayload && messagePayload.command
      ? messagePayload.command
      : null
  }

  const session = stateMachine.has(peerId)
    ? stateMachine.get(peerId)
    : {}

  ctx.state.session = session
  ctx.clearSession = () => {
    for (var member in ctx.state.session) delete ctx.state.session[member]
  }

  await next()

  stateMachine.set(peerId, session)
})

updates.on('message', async (ctx, next) => {
  console.log(ctx)
  next()
})

updates.on('message', async (ctx, next) => {
  if (ctx.state.command === 'cancel' || ctx.text === '/cancel') {
    ctx.clearSession()

    ctx.send({
      message: 'OK.',
      keyboard: menu
    })
  } else await next()
})

// команда eval для дебага
updates.on('message', async (ctx, next) => {
  let evalRegex = /\/e\s+(.*)/is
  if (ctx.text && evalRegex.test(ctx.text)) {
    if (ctx.senderId === 152199439) {
      let result
      try {
        // eslint-disable-next-line no-eval
        result = require('util').inspect(eval(ctx.text.match(evalRegex)[1]))
      } catch (e) {
        result = e.toString()
      }
      return ctx.reply(result)
    } else {
      return ctx.reply('nope')
    }
  } else await next()
})

// в беседах работает только одна вещь - подключение серверов
updates.on('message', async (ctx, next) => {
  if (ctx.isChat) {
    if (/[A-Z0-9]{5}$/.test(ctx.text)) {
      await add.addToGroup(ctx)
    } else if (/@uptimebot/.test(ctx.text)) {
      await ctx.send(txt.isChat)
    }
  } else await next()
})

const hearCommand = (name, conditions, handle) => {
  if (typeof handle !== 'function') {
    handle = conditions
    conditions = [`/${name}`]
  }

  if (!Array.isArray(conditions)) {
    conditions = [conditions]
  }

  updates.hear(
    [
      (text, { state }) => (
        state.command === name
      ),
      ...conditions
    ],
    handle
  )
}

updates.use(add.middleware)
updates.use(del.middleware)

hearCommand('add', add.commandHandler)
hearCommand('del', del.commandHandler)
hearCommand('list', list)

// Хэндлер всех неотвеченных сообщений
updates.hear(/.*/, ctx => ctx.send({
  sticker_id: sample(stickers),
  keyboard: menu
}))

export default updates.getKoaWebhookMiddleware()
