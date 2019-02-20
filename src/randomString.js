export default len => {
  let outStr = ''; let newStr
  while (outStr.length < len) {
    newStr = Math.random().toString(36).slice(2)
    outStr += newStr.slice(0, Math.min(newStr.length, (len - outStr.length)))
  }
  return outStr.toUpperCase()
}
