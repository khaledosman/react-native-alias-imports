const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const path = require('path')

async function getNameFromPackageJson (dirPath) {
  const fileContent = await readFile(path.join(dirPath, 'package.json'), 'utf8')
  return JSON.parse(fileContent).name
}

module.exports.getNameFromPackageJson = getNameFromPackageJson
