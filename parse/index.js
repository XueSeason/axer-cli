const httpParse = require('./http')

module.exports = function (content) {
  return httpParse(content)
}