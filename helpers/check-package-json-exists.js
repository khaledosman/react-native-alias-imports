const fs = require('fs')
const { promisify } = require('util')
const lstat = promisify(fs.lstat)
const path = require('path')
const { checkFileExists } = require('./check-file-exists')

function checkPackageJsonExists (dirPath) {
  return lstat(dirPath)
    .then(fileStats => {
      const isDirectory = fileStats.isDirectory()
      if (isDirectory) {
        return checkFileExists(path.join(dirPath, 'package.json'))
      } else {
        throw Error(`not a directory ${dirPath}`)
      }
    })
}

module.exports.checkPackageJsonExists = checkPackageJsonExists
