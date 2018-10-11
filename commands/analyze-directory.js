const fs = require('fs')
const { promisify } = require('util')
const readDir = promisify(fs.readdir)
const path = require('path')
const { checkPackageJsonExists } = require('../helpers/check-package-json-exists')
const { getNameFromPackageJson } = require('../helpers/get-name-from-package-json')
const { filterDirectoriesFromSubFiles } = require('../helpers/filter-directories-from-subfiles')

function analyzeDirectory (dirPath, results) {
  return checkPackageJsonExists(dirPath)
    .then(async hasPackageJson => {
      let transform = {}
      if (hasPackageJson) {
        // console.log(dirPath, 'hasPackageJson')
        const name = await getNameFromPackageJson(dirPath)
        transform = { name, dirPath }
      }
      let subFiles = await readDir(dirPath)
      const filtered = await filterDirectoriesFromSubFiles(dirPath, subFiles)
      subFiles = subFiles.map(file => ({
        file,
        isDirectory: filtered.includes(file)
      }))
      if (!isEmpty(transform)) {
        transform = { ...transform, subFiles }
        results.push(transform)
      }
      return filtered
    })
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

function isEmpty (obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

module.exports.findImportableDirectories = findImportableDirectories
