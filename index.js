#!/usr/bin/env node

const fse = require('fs-extra')
const path = require('path')
const program = require('commander')
const axios = require('axios')
const version = require('./package.json').version

const trPath = path.join(__dirname, 'tr.txt')

const collect = (val, memo) => {
  memo.push(val)
  return memo
}

const getList = () => {
  return axios.get('https://github.com/ngosang/trackerslist/raw/master/trackers_best.txt').then(data => {
    saveTrackers(data.data)
    const list = data.data.trim().split('\n\n')
    return list
  }).catch(e => {
    console.error(e.message)
    console.warn('获取tr失败，使用本地tr')
    return getLocalTrackers()
  })
}

const saveTrackers = data => {
  fse.writeFileSync(trPath, data)
  console.log('保存tr成功')
}

const getLocalTrackers = () => {
  if (fse.pathExistsSync(trPath)) {
    const buf = fse.readFileSync(trPath)
    const data = buf.toString()
    const list = data.trim().split('\n\n')
    return list
  }
  return []
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