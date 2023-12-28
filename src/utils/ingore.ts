/**
 * Compile the given `.gitignore` content (not filename!)
 * and return an object with `accepts`, `denies` and `maybe` methods.
 * These methods each accepts a single filename and determines whether
 * they are acceptable or unacceptable according to the `.gitignore` definition.
 */
export function compile(content: string) {
  const parsed = parse(content)
  const positives = parsed[0]
  const negatives = parsed[1]
  return {
    accepts(input: string) {
      return negatives[0].test(input) || !positives[0].test(input)
    },
    denies(input: string) {
      return !(negatives[0].test(input) || !positives[0].test(input))
    },
    maybe(input: string) {
      return negatives[1].test(input) || !positives[1].test(input)
    },
  }
}

/**
 * Parse the given `.gitignore` content and return an array
 * containing two further arrays - positives and negatives.
 * Each of these two arrays in turn contains two regexps, one
 * strict and one for 'maybe'.
 */
export function parse(content: string) {
  return content
    .split('\n')
    .map((line) => {
      line = line.trim()
      return line
    })
    .filter((line) => {
      return line && line[0] !== '#'
    })
    .reduce(
      (lists, line) => {
        const isNegative = line[0] === '!'
        if (isNegative)
          line = line.slice(1)

        if (line[0] === '/')
          line = line.slice(1)
        if (isNegative)
          lists[1].push(line)

        else
          lists[0].push(line)

        return lists
      },
      [[] as string[], []],
    )
    .map((list) => {
      return list
        .sort()
        .map(prepareRegexes)
        .reduce(
          (list, prepared) => {
            list[0].push(prepared[0])
            list[1].push(prepared[1])
            return list
          },
          [[] as string[], [], []],
        )
    })
    .map((item) => {
      return [
        item[0].length > 0
          ? new RegExp(`^((${item[0].join(')|(')}))`)
          : /$^/,
        item[1].length > 0
          ? new RegExp(`^((${item[1].join(')|(')}))`)
          : /$^/,
      ]
    })
}

function prepareRegexes(pattern: string) {
  return [
    // exact regex
    prepareRegexPattern(pattern),
    // partial regex
    preparePartialRegex(pattern),
  ]
}

function prepareRegexPattern(pattern: string) {
  return escapeRegex(pattern).replace('**', '(.+)').replace('*', '([^\\/]+)')
}

function preparePartialRegex(pattern: string) {
  return pattern
    .split('/')
    .map((item, index) => {
      if (index)
        return `([\\/]?(${prepareRegexPattern(item)}\\b|$))`
      else return `(${prepareRegexPattern(item)}\\b)`
    })
    .join('')
}

function escapeRegex(pattern: string) {
  return pattern.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, '\\$&')
}
