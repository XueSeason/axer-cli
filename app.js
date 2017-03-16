#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const url = require('url')

const program = require('commander')
const request = require('request')
const package = require('./package.json')
const file = require('axer').file

const httpPacketParse = require('./parse')

program
  .version(package.version)
  .option('-p, --payload [path]', 'append payload file [path]', './payload')
  .option('-o, --out [path]', 'output response to file [path]', './axer.out.json')
  .parse(process.argv)

const payloadPath = path.resolve(program.payload)
const outPath = path.resolve(program.out)

async function exec () {
  await file.touch(payloadPath)
  await file.touch(outPath)

  const payload = await file.cat(payloadPath)
  console.log('--------------Request payload---------------')
  console.log(payload)
  console.log('--------------Request parse---------------')
  const packet = httpPacketParse(payload)
  console.log(packet)

  console.log('--------------Request exec---------------')
  const reqUrl = url.resolve(`http://${packet.headers.host}`, packet.line.uri)
  const method = packet.line.method.toLowerCase()
  const headers = packet.headers

  if (method === 'get') {
    request({ url: reqUrl, headers }, (err, httpResponse, body) => {
      if (err) {
        console.error(err)
        return
      }
      file.echo(JSON.stringify(httpResponse, null, 2), outPath)
    })
  } else if (method === 'post') {
    request.post({ url: reqUrl, form: packet.body, headers }, (err, httpResponse, body) => {
      if (err) {
        console.error(err)
        return
      }
      file.echo(JSON.stringify(httpResponse, null, 2), outPath)
    })
  }
}

exec()
