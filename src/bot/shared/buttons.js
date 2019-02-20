import { Keyboard } from 'vk-io'
import txt from '../../txt'

export const cancelButton = Keyboard.textButton({
  label: txt.cancel,
  payload: {
    command: 'cancel'
  },
  color: Keyboard.NEGATIVE_COLOR
})

export const menu = Keyboard.keyboard([
  [
    Keyboard.textButton({
      label: txt.add.title,
      payload: {
        command: 'add'
      },
      color: Keyboard.PRIMARY_COLOR
    }),
    Keyboard.textButton({
      label: txt.del.title,
      payload: {
        command: 'del'
      },
      color: Keyboard.NEGATIVE_COLOR
    })
  ], [
    Keyboard.textButton({
      label: txt.list.title,
      payload: {
        command: 'list'
      }
    })
  ]
])
