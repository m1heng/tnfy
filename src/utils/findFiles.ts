import { lstatSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { findUp } from 'find-up'
import walk from 'ignore-walk'

/**
 * Find files with specified extensions
 * @param startPath The path to start searching (absolute)
 * @param options
 * @param options.gitignore  Whether to use .gitignore
 * @param options.extensions  The extensions to search for
 * @returns The found files (absolute)
 */
export async function findFiles(startPath: string, options?: {
  gitignore: boolean
  extensions: string[]
}): Promise<string[]> {
  const { gitignore = true, extensions = ['png'] } = options ?? {}
  // if path is file return it
  if (lstatSync(startPath).isFile())
    return [startPath]

  // if gitignore is false return all files with specified extensions
  if (!gitignore) {
    return readdirSync(startPath, {
      recursive: true,
    }).filter((file) => {
      if (typeof file !== 'string')
        return false
      const ext = file.split('.').pop()
      return ext ? extensions.includes(ext) : false
    }) as string[]
  }

  const gitHiddenRoot = await findUp('.git', {
    cwd: startPath,
    type: 'directory',
  })
  if (!gitHiddenRoot)
    throw new Error('No .git directory found but gitignore is true')
  const gitRoot = gitHiddenRoot.replace('/.git', '')

  return walk.sync({
    path: gitRoot,
    ignoreFiles: ['.gitignore'],
    follow: false,
  }).filter((file) => {
    if (typeof file !== 'string')
      return false
    const ext = file.split('.').pop()
    return ext ? extensions.includes(ext) : false
  }).map(file => resolve(gitRoot, file))
    .filter(file => file.startsWith(startPath))
}
