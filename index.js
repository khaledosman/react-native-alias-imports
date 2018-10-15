#!/usr/bin/env node

const program = require('commander')
const figlet = require('figlet')
const { getCLIVersion } = require('./helpers/get-cli-version')
const { findImportableDirectories } = require('./commands/analyze-directory')
const { Spinner } = require('./helpers/spinner')
const chalk = require('chalk')

initCli()
// const storage = {}
async function initCli () {
  console.log(figlet.textSync('Aliased Imports', {
    // font: 'Dancing Font',
    horizontalLayout: 'full',
    verticalLayout: 'full'
  }))

  const version = await getCLIVersion()
  program
    .version(version, '-v, --version')
    .option('-r, --rootPath <filePath>', 'optional path to root directory to start scanning for imports')
    .option('-p, --printSubDirectories', 'optional flag to print subfiles for each subdirectory')
    .option('-a, --aliasName <name>', 'optional flag to print subfiles for the alias subdirectory')
    .description('Analyze directory and print aliases for each directory that can be used as imports for react-native')
    .parse(process.argv)

  const rootPath = program.rootPath || process.cwd()
  const printSubDirectories = program.printSubDirectories
  const isPrintingAlias = program.aliasName
  const spinner = new Spinner('Analyzing directories')
  spinner.start()

  findImportableDirectories(rootPath)
    .then((results) => {
      spinner.end()
      // storage.results = results
      // console.log('results', results)
      if (isPrintingAlias) {
        // console.log('alias')
        printResults(results.filter(r => r.name === program.aliasName), printSubDirectories)
      } else {
        printResults(results, printSubDirectories)
      }
    })
    .catch(err => {
      console.error(err)
      spinner.end()
    })
}

function printResults (results, shouldPrintSubDirectories) {
  // console.log(results)
  results.map(result => {
    console.log(chalk.cyan.underline(result.name) + ': ' + chalk.green(result.dirPath))
    if (shouldPrintSubDirectories) {
      result.subFiles
        .sort((a, b) => a.isDirectory ? -1 : 1)
        .map(async file => {
          file.isDirectory ? console.log(chalk.white.bold(file.file)) : console.log(chalk.gray.italic(file.file))
        })
    }
    process.stdout.write('\n')
  })
}
