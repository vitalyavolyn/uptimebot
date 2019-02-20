import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import { join } from 'path'

const adapter = new FileSync(join(__dirname, '../db.json'))
const db = low(adapter)

db.defaults({ users: [], secrets: {} }).write()

export default db
