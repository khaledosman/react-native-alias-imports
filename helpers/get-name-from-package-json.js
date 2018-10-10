const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const path = require('path')

async function getNameFromPackageJson (dirPath) {
  const fileContent = await readFile(path.join(dirPath, 'package.json'), 'utf8')
  const name = JSON.parse(fileContent).name
  return name
}

module.exports.getNameFromPackageJson = getNameFromPackageJson
