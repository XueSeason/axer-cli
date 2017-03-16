function parseLine(line) {
  const arr = line.split(' ')
  const method = arr[0]
  const uri = arr[1]
  const version = arr[2]

  if (method && uri && version) {
    return { method, uri, version }
  } else {
    throw new Error('Error happened in parse request line.')
  }
}

function parseHeaders(lines) {
  const headers = {}
  lines.forEach(line => {
    const mid = line.indexOf(':')
    const key = line.slice(0, mid).trim()
    const value = line.slice(mid + 1, line.length).trim()
    if (key !== '') {
      headers[key.toLowerCase()] = value
    }
  })
  return headers
}

function parseBody(content, contentType) {
  if (contentType === 'application/x-www-form-urlencoded') {
    const items = content.split('&')
    const form = {}
    items.forEach(item => {
      const mid = item.indexOf('=')
      const key = item.slice(0, mid).trim()
      const value = item.slice(mid + 1, item.length).trim()
      if (key !== '') {
        form[key] = value
      }
    })
    return form
  } else if (contentType === 'application/json') {
    return JSON.parse(content)
  } else {
    return content
  }
}

module.exports = function (content) {
  const mid = content.indexOf('\n\n')
  const arr = mid > 0 ? [content.slice(0, mid), content.slice(mid+2)] : [content]
  const lines = arr[0].split('\n')

  const line = parseLine(lines[0])
  const headers = parseHeaders(lines.slice(1))
  const body = parseBody(arr[1], headers['content-type'])
  return { line, headers, body }
}