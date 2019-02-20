import { Keyboard } from 'vk-io'
import { URL } from 'url'

import randomString from '../randomString'
import txt from '../txt'
import check from '../check'
import { cancelButton, menu } from './shared/buttons'

export const connectChat = {}

export async function commandHandler (ctx) {
  await ctx.send({
    message: txt.add.enterURL,
    keyboard: Keyboard.keyboard([cancelButton])
  })

  ctx.state.session.add = { stage: 'enterURL' }
}

export async function middleware (ctx, next) {
  if (!ctx.state.session.add) return next()

  if (ctx.state.session.add.stage === 'enterURL') {
    let url, type
    let text = ctx.text || ctx.attachments[0].url
    if (text.startsWith('http')) {
      url = new URL(text)
      type = 'http'
    } else {
      type = ctx.text.includes(':') ? 'socket' : 'ping'
      url = new URL(`${type}://${ctx.text}`)
    }

    await ctx.send({
      message: txt.add.chooseTarget,
      keyboard: Keyboard.keyboard([
        [
          Keyboard.textButton({
            label: txt.add.pm
          }),
          Keyboard.textButton({
            label: txt.add.chat
          })
        ]
      ]).oneTime()
    })

    ctx.state.session.add = {
      stage: 'chooseTarget',
      server: { url, type }
    }
  } else if (ctx.state.session.add.stage === 'chooseTarget') {
    const text = ctx.text

    if (text === txt.add.pm) {
      await add(ctx)
      ctx.clearSession()
    } else if (text === txt.add.chat) {
      let { user } = ctx.state
      let { server } = ctx.state.session.add

      let r = randomString(5)

      connectChat[r] = {
        user,
        server
      }

      await ctx.send(txt.add.connectStart)
      await ctx.send({
        message: `@uptimebot ${r}`,
        keyboard: menu
      })
      ctx.clearSession()
    }
  }
}

export async function addToGroup (ctx) {
  await add(ctx)
}

async function add (ctx) {
  let target = ctx.peerId

  let user, server, random

  if (ctx.isChat) {
    random = ctx.text.match(/[A-Z0-9]{5}$/)[0] // @uptimebot 123AB

    user = connectChat[random].user
    server = connectChat[random].server
  } else {
    user = ctx.state.user
    server = ctx.state.session.add.server
  }

  const serverObj = {
    id: randomString(10),
    to: target,
    status: null,
    ...server
  }

  await check(serverObj)

  ctx.db
    .get('users')
    .find(user)
    .get('servers')
    .push(serverObj)
    .write()

  await ctx.send({
    message: txt.add.done(server.url.toString()),
    keyboard: ctx.isChat ? Keyboard.keyboard([]) : menu // пустая клавиатура в чатах
  })
  if (ctx.isChat) delete connectChat[random]
}
