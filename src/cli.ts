import process from 'node:process'
import y from 'yargs/yargs'
import { version } from '../package.json'
import { run } from './run'

const cli = y(process.argv.slice(2)).scriptName('tnfy')
  .usage('$0 [args]')
  .version(version)
  .strict()
  .showHelpOnFail(false)
  .alias('h', 'help')
  .alias('v', 'version')

cli.command('*', 'Compresses a directory', yargs =>
  yargs
    .option('gitgnore', {
      alias: 'g',
      type: 'boolean',
      description: 'Path to .gitignore file',
      default: true,
    }).option('apikey', {
      alias: 'k',
      type: 'string',
      description: 'API key for tinypng.com',
    }).option('path', {
      alias: 'p',
      type: 'string',
      description: 'Path to directory',
    }).demandOption(['apikey', 'path'], 'Please'), async (argv) => {
  await run({
    ...argv,
  })
})
cli
  .help()
  .parse()
