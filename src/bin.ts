#!/usr/bin/env node

import program from 'commander'
import { getMagnet } from './index'

const collect = (val: string, memo: string[]) => {
  memo.push(val)
  return memo
}

const parse = () => {
  let originMagnet: string = ''
  program
    .arguments('<magnet>')
    .option('-d,--dn <value>', 'DownLoad Name')
    .option('-t,--tr [value]', 'BT Trackers', collect, [])
    .option('-r,--replace', 'Replace Origin Trackers')
    .action((magnet: string) => {
      originMagnet = magnet
    })
    .parse(process.argv)

  console.log('tracker追加中...')
  getMagnet(originMagnet, program.dn, program.tr, { replaceTracker: program.replace }).then(magnet => {
    console.log('magnet=>', magnet)
    process.exit(0)
  }).catch(err => {
    console.error(err)
    process.exit(0)
  })
}

parse()