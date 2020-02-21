#!/usr/bin/env node

const fse = require('fs-extra')
const path = require('path')
const fetch = require('node-fetch')
const program = require('commander')
const version = require('./package.json').version

const trPath = path.join(__dirname, 'tr.txt')

const collect = (val, memo) => {
  memo.push(val)
  return memo
}

const getList = () => {
  return fetch("https://ngosang.github.io/trackerslist/trackers_best.txt").then(res => {
    return res.text()
  }).then(data => {
    saveTrackers(data)
    const list = data.trim().split('\n\n')
    return list
  }).catch(e => {
    console.error(e.message)
    console.warn('获取tr失败，使用本地tr')
    return getLocalTrackers().then(({ list }) => list)
  })
}

const saveTrackers = data => {
  const now = new Date().getTime()
  const dataWithTime = `${data}-$${now}`
  fse.writeFileSync(trPath, dataWithTime)
  console.log('保存tr成功')
}

const getLocalTrackers = () => {
  if (fse.pathExistsSync(trPath)) {
    const buf = fse.readFileSync(trPath)
    const dataWithDate = buf.toString()
    const [data, time] = dataWithDate.split('-$')
    const list = data.trim().split('\n\n')
    return Promise.resolve({ list, time })
  }
  return Promise.resolve({ list, time })
}

const parse = () => {
  getLocalTrackers().then(({ list, time }) => {
    const now = new Date().getTime()
    const oneDay = 24 * 60 * 60 * 1000
    if (!time || now > (+time) + oneDay) {
      return getList()
    } else {
      return list
    }
  }).then((list) => {
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