#!/usr/bin/env node

const program = require('commander')
const figlet = require('figlet')
const { getCLIVersion } = require('./helpers/get-cli-version')
const fs = require('fs')
const { promisify } = require('util')
const lstat = promisify(fs.lstat)
const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const path = require('path')
const chalk = require('chalk')
const { checkFileExists } = require('./helpers/check-file-exists')

const results = []

initCli()

async function initCli () {
  const version = await getCLIVersion()

  program
    .version(version, '-v, --version')

  program
    .option('-p, --path', 'path to root directory to start scanning for imports')
    .description('Analyze directory and print aliases for each directory that can be used as imports for react-native')
    .action(async (path = process.cwd(), options) => {
      analyzeDirectory(path)
        .then(() => {
          console.log('results', results)
        })
    })

  console.log(figlet.textSync('Aliased Imports', {
    // font: 'Dancing Font',
    horizontalLayout: 'full',
    verticalLayout: 'full'
  }))

  program.parse(process.argv)
  // if no commands/arguments specified, show the help
  if (!process.argv.slice(2).length) {
    program.help()
  }
}

function analyzeDirectory (dirPath) {
  return checkPackageJson(dirPath)
    .then(async hasPackageJson => {
      if (hasPackageJson) {
        console.log(dirPath, 'hasPackageJson')
        const name = getNameFromPackageJson(dirPath)
        results.push({ name, dirPath })
      }
      return readDir(dirPath)
    })
    .then(subFiles => getSubfilesThatAreDirectories(dirPath, subFiles))
    .then(subDirectories => {
      console.log('dirPath', dirPath, 'subDirectories', subDirectories)
      return Promise.all(subDirectories.map(subDirectory => analyzeDirectory(path.join(dirPath, subDirectory))))
    })
}

async function getNameFromPackageJson (dirPath) {
  const fileContent = await readFile(path.join(dirPath, 'package.json'), 'utf8')
  const name = JSON.parse(fileContent).name
  return name
}

function checkPackageJson (dirPath) {
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

function getSubfilesThatAreDirectories (dirPath, subFiles) {
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
