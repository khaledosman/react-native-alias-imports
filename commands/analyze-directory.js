const fs = require('fs')
const { promisify } = require('util')
const readDir = promisify(fs.readdir)
const path = require('path')
const { checkPackageJsonExists } = require('../helpers/check-package-json-exists')
const { getNameFromPackageJson } = require('../helpers/get-name-from-package-json')
const { filterDirectoriesFromSubfiles } = require('../helpers/filter-directories-from-subfiles')
function analyzeDirectory (dirPath, results) {
  return checkPackageJsonExists(dirPath)
    .then(async hasPackageJson => {
      if (hasPackageJson) {
        // console.log(dirPath, 'hasPackageJson')
        const name = await getNameFromPackageJson(dirPath)
        results.push({ name, dirPath })
      }
      return readDir(dirPath)
    })
    .then(subFiles => filterDirectoriesFromSubfiles(dirPath, subFiles))
    .then(subDirectories => {
      // console.log('dirPath', dirPath, 'subDirectories', subDirectories)
      return Promise.all(subDirectories.map(subDirectory => analyzeDirectory(path.join(dirPath, subDirectory), results)))
    })
}

function findImportableDirectories (dirPath) {
  const results = []
  return analyzeDirectory(dirPath, results)
    .then(() => {
      return results
    })
}

module.exports.findImportableDirectories = findImportableDirectories
