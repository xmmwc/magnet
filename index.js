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
  return fetch("https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt", {"credentials":"omit","headers":{"accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","accept-language":"zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6","cache-control":"no-cache","pragma":"no-cache","sec-fetch-mode":"navigate","sec-fetch-site":"none","sec-fetch-user":"?1","upgrade-insecure-requests":"1"},"referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"GET","mode":"cors"}).then(res => {
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