import { resolve } from 'node:path'
import process from 'node:process'
import { MultiBar, Presets } from 'cli-progress'
import pLimit from 'p-limit'
import consola from 'consola'
import { findFiles } from './utils/findFiles'
import { tinifyWithProgress } from './tinify'

export async function run({
  apikey,
  gitignore = true,
  path: _path,
}: {
  apikey: string
  gitignore?: boolean
  path: string
}, t = consola) {
  const path = _path.startsWith('/') ? _path : resolve(process.cwd(), _path)

  // find files
  const files = await findFiles(path, {
    gitignore,
    extensions: ['png'],
  })

  t.info(`Found ${files.length} files.`)
  await t.prompt('Press any key to continue.')

  const multibar = new MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {filename} | {stage} {value}%',
  }, Presets.rect)
  const l = pLimit(5)

  await Promise.all(
    files.map((f) => {
      return l(async () => {
        const progressBar = multibar.create(100, 0, {
          filename: f.replace(path, ''),
          stage: 'upload',
        })
        try {
          await tinifyWithProgress(f, apikey, (e) => {
            progressBar.update(Number((e.progress * 100).toFixed(0)), {
              stage: e.stage,
            })
          })
        }
        catch (error) {
          t.error(`Error processing ${f}: ${(error as Error).message}}`)
        }
        finally {
          progressBar.stop()
        }
      })
    }),
  )
  multibar.stop()
}
