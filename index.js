#!/usr/bin/env node

const program = require('commander')
const figlet = require('figlet')
const { getCLIVersion } = require('./helpers/get-cli-version')
const { findImportableDirectories } = require('./commands/analyze-directory')
const { Spinner } = require('./helpers/spinner')
const chalk = require('chalk')
initCli()

async function initCli () {
  const version = await getCLIVersion()
  program
    .version(version, '-v, --version')
    .option('-p, --path <filePath>', 'path to root directory to start scanning for imports')
    .description('Analyze directory and print aliases for each directory that can be used as imports for react-native')
    .parse(process.argv)

  console.log(figlet.textSync('Aliased Imports', {
    // font: 'Dancing Font',
    horizontalLayout: 'full',
    verticalLayout: 'full'
  }))

  const spinner = new Spinner('Analyzing directories')
  spinner.start()
  findImportableDirectories(program.path || process.cwd())
    .then((results) => {
      // console.log('results', results)
      results.map(result => {
        console.log(chalk.cyan(result.name) + ': ' + chalk.green(result.dirPath))
      })
      spinner.end()
    })
    .catch(err => {
      console.error(err)
      spinner.end()
    })
}
