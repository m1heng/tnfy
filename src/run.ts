import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { findUpMultiple } from 'find-up'
import { MultiBar, Presets } from 'cli-progress'
import pLimit from 'p-limit'
import consola from 'consola'
import { compile } from './utils/ingore'
import { tinifyWithProgress } from './tinify'

export async function run({
  apikey,
  gitgnore,
  path: _path,
}: {
  apikey: string
  gitgnore: boolean
  path: string
}, t = consola) {
  const path = _path.startsWith('/') ? _path : resolve(process.cwd(), _path)

  let files: string[] = readdirSync(path, {
    recursive: true,
  }) as string[]

  if (gitgnore) {
    const ignoreFile = await findUpMultiple('.gitignore', {
      cwd: path,
    })
    if (!ignoreFile)
      throw new Error('No .gitignore file found.')

    const gitignore = compile(
      ignoreFile.map(file => readFileSync(file, 'utf8')).join('\n'),
    )

    files = files.filter(gitignore.accepts).filter(p => p.endsWith('.png'))
  }

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
      const fullPath = resolve(path, f)
      return l(async () => {
        const progressBar = multibar.create(100, 0, {
          filename: f,
          stage: 'upload',
        })
        try {
          await tinifyWithProgress(fullPath, apikey, (e) => {
            progressBar.update(Number((e.progress * 100).toFixed(0)), {
              stage: e.stage,
            })
          })
        }
        catch (error) {
          t.error(`Error processing ${fullPath}: ${(error as Error).message}}`)
        }
        finally {
          progressBar.stop()
        }
      })
    }),
  )
  multibar.stop()
}
