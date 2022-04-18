import { lazy } from 'solid-js'

const pageModules = import.meta.glob('./routes/**/*.tsx')

export const routes = Object.entries(pageModules)
  .map(([path, load]) => ({
    path: pathToRoute(path),
    component: lazy(load as any),
  }))
  .sort((a, b) => a.path.localeCompare(b.path))

function pathToRoute(path: string) {
  const parts = path.slice('./routes/'.length).split('/')
  const dirs = parts.slice(0, parts.length - 1).map(dirPattern)
  const file = filePattern(parts[parts.length - 1])

  return '/' + [...dirs, file].filter(s => s).join('/')
}

function dirPattern(dir: string) {
  const match = dir.match(/^\[(.+)\]$/)
  if (match) {
    return ':' + match[1]
  }
  return dir
}

function filePattern(file: string) {
  if (file === 'index.tsx') return ''
  const match = file.match(/^\[(.+)\]\.tsx$/)
  if (match) {
    return ':' + match[1]
  }
  return file.slice(0, file.length - '.tsx'.length)
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('maps dir to pattern', () => {
    expect(dirPattern('foo')).toBe('foo')
    expect(dirPattern('[foo]')).toBe(':foo')
  })

  it('maps file to a pattern', () => {
    expect(filePattern('index.tsx')).toBe('')
    expect(filePattern('[foo].tsx')).toBe(':foo')
    expect(filePattern('foo.tsx')).toBe('foo')
  })

  it('maps file path to router pattern', () => {
    expect(pathToRoute('./routes/index.tsx')).toBe('/')
    expect(pathToRoute('./routes/foo/index.tsx')).toBe('/foo')
    expect(pathToRoute('./routes/[foo]/index.tsx')).toBe('/:foo')
    expect(pathToRoute('./routes/[foo]/[bar]/index.tsx')).toBe('/:foo/:bar')
    expect(pathToRoute('./routes/[foo]/[bar]/baz.tsx')).toBe('/:foo/:bar/baz')
    expect(pathToRoute('./routes/[foo]/[bar]/[baz].tsx')).toBe(
      '/:foo/:bar/:baz',
    )
  })
}
