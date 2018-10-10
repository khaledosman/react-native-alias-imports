const fs = require('fs')
const { promisify } = require('util')
const lstat = promisify(fs.lstat)
const path = require('path')

function filterDirectoriesFromSubfiles (dirPath, subFiles) {
  return Promise.all(subFiles.map(async subFile => {
    const stats = await lstat(path.join(dirPath, subFile))
    return {
      isDirectory: stats.isDirectory(),
      subFile
    }
  }))
    .then(items => items.filter(item => item.isDirectory && !item.subFile.endsWith('node_modules') && !item.subFile.endsWith('.git')))
    .then(items => items.map(i => i.subFile))
}
module.exports.filterDirectoriesFromSubfiles = filterDirectoriesFromSubfiles
