import _ from 'lodash'
import { Keyboard } from 'vk-io'

import txt from '../txt'
import { cancelButton, menu } from './shared/buttons'

export async function commandHandler (ctx) {
  const buttons = _(ctx.state.user.servers)
    .take(19)
    .map(e =>
      Keyboard.textButton({
        label: e.url.substring(0, 30),
        color: e.to > 2e9 ? Keyboard.PRIMARY_COLOR : Keyboard.DEFAULT_COLOR,
        payload: {
          id: e.id
        }
      })
    )
    .push(cancelButton)
    .chunk(2)
    .value()

  await ctx.send({
    message: txt.del.chooseServer,
    keyboard: Keyboard.keyboard(buttons)
  })
  ctx.state.session.del = { stage: 'chooseServer' }
}

export async function middleware (ctx, next) {
  if (!ctx.state.session.del) return next()

  if (ctx.state.session.del.stage === 'chooseServer') {
    const { id } = ctx.messagePayload
    const check = ctx.state.user.servers.find(s => s.id === id)
    if (!check) return ctx.send('Что-то не так...')

    await ctx.send({
      message: txt.del.done,
      keyboard: menu
    })

    ctx.db
      .get('users')
      .find({ id: ctx.state.user.id })
      .get('servers')
      .remove({ id })
      .write()

    ctx.clearSession()
  }
}
