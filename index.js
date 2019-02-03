#!/usr/bin/env node

const program = require('commander')
const axios = require('axios')
const version = require('./package.json').version



const collect = (val, memo) => {
  memo.push(val)
  return memo
}

const getList = () => {
  return axios.get('https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt').then(data => {
    const list = data.data.trim().split('\n\n')
    return list
  }).catch(e => {
    console.log(e)
  })
}

const parse = () => {
  getList().then((list) => {
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

    if (program.dn) {
      originMagnet += `&dn=${program.dn}`
    }

    const tr = [].concat(list, program.tr).map(link => 'tr=' + encodeURIComponent(link)).join('&')

    originMagnet += `&${tr}`

    console.log('magnet=>', originMagnet)
  })
}

parse()