import db from './db'
import { VK } from 'vk-io'

const { secrets } = db.value()

const vk = new VK({
  token: secrets.vktoken,
  apiLimit: 20,
  webhookSecret: secrets.vksecret,
  webhookConfirmation: secrets.confirm
})

export default vk
