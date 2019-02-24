import txt from '../txt'
const { list } = txt

export default ctx => ctx.send(
  `${list.text}${ctx.state.user.servers.map(e => `-- ${e.url} ${e.to > 2e9 ? list.chat : ''} статус: ${e.status ? '✔' : '❌'}`).join('\n')}`
)
