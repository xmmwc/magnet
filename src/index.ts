import fse from 'fs-extra'
import path from 'path'
import fetch from 'node-fetch'
import uri from 'urijs'


const trPath = path.join(__dirname, 'tr.txt')
const magnetTest = /magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i

export interface TrackerStorageInterface {
  list: string[],
  time: number
}

const getTrackers = () => {
  return fetch("https://ngosang.github.io/trackerslist/trackers_best.txt").then(res => {
    return res.text()
  }).then(data => {
    return data.trim().split('\n\n')
  })
}

const saveTrackers = (listData: TrackerStorageInterface) => {
  const list = JSON.stringify(listData)
  fse.writeFileSync(trPath, list)
}

const getLocalTrackers: () => Promise<TrackerStorageInterface> = () => {
  if (fse.pathExistsSync(trPath)) {
    const buf = fse.readFileSync(trPath)
    const dataWithDate = buf.toString()
    const trackerData: TrackerStorageInterface = JSON.parse(dataWithDate)
    return Promise.resolve(trackerData)
  }
  return Promise.resolve({ list: [], time: 0 })
}

export interface MagnetOption {
  getTracker?: () => Promise<TrackerStorageInterface>,
  saveTracker?: (trackerData: TrackerStorageInterface) => Promise<void>,
  replaceTracker?: boolean
}

interface MagnetQuery {
  xt: string,
  dn: string,
  tr: string[]
}

export const getMagnet = (magnet: string, downloadName?: string, trackers: string[] = [], option?: MagnetOption) => {
  if (magnetTest.test(magnet)) {
    const defaultOption = {
      getTracker: getLocalTrackers,
      saveTracker: saveTrackers,
      replaceTracker: false
    }
    const magnetOption = Object.assign({}, defaultOption, option)
    return magnetOption.getTracker().then(({ list, time }) => {
      const now = new Date().getTime()
      const oneDay = 24 * 60 * 60 * 1000
      if (!time || now > (+time) + oneDay) {
        return getTrackers().then(async (list) => {
          await magnetOption.saveTracker({ list, time: now })
          return list
        })
      } else {
        return list
      }
    }).then(list => {
      const originMagnet = uri(magnet)
      const originalQuery: MagnetQuery = uri.parseQuery(magnet.split('?')[1]) as MagnetQuery
      const tr = [...list, ...trackers]
      if (downloadName) {
        originMagnet.setQuery('dn', downloadName)
      }
      if (magnetOption.replaceTracker) {
        originMagnet.setQuery({ tr })
      } else {
        originMagnet.addQuery({ tr })
      }
      originMagnet.removeQuery('xt')
      const finalMagnet = `magnet:?xt=${originalQuery.xt}&${originMagnet.query()}`
      return finalMagnet
    })
  } else {
    return Promise.reject(new Error('magnet格式不正确'))
  }

}