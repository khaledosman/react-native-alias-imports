const fs = require('fs')
const { promisify } = require('util')
const lstat = promisify(fs.lstat)
const path = require('path')

const blacklistedDirectories = ['node_modules', '.git']
function filterDirectoriesFromSubFiles (dirPath, subFiles) {
  return Promise.all(subFiles.map(async subFile => {
    const stats = await lstat(path.join(dirPath, subFile))
    return {
      isDirectory: stats.isDirectory(),
      file: subFile
    }
  }))
    .then(items => items.filter(item => item.isDirectory && !blacklistedDirectories.includes(item.file)))
    .then(items => items.map(f => f.file))
}
module.exports.filterDirectoriesFromSubFiles = filterDirectoriesFromSubFiles
