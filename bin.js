#!/usr/bin/env node

const program = require('commander')
const getMagnet = require('./index')
const version = require('./package.json').version

const collect = (val, memo) => {
  memo.push(val)
  return memo
}

const parse = () => {
  let originMagnet = ''
  program
    .version(version)
    .arguments('<magnet>')
    .option('-d,--dn <value>', 'DownLoad Name')
    .option('-t,--tr [value]', 'BT Trackers', collect, [])
    .action((magnet) => {
      originMagnet = magnet
    })
    .parse(process.argv)

  getMagnet(originMagnet, program.dn).then(magnet => {
    console.log('magnet=>', magnet)
    process.exit(0)
  }).catch(err => {
    console.error(err)
    process.exit(-1)
  })
}

parse()