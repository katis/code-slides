import { lazy } from 'solid-js'

const pageModules = import.meta.glob('./routes/**/!(*.data).tsx')

const pageDataModules = import.meta.globEager('./routes/**/*.data.tsx')

export const routes = Object.entries(pageModules)
  .map(([path, load]) => ({
    path: pathToRoute(path),
    component: lazy(load as any),
    data: pageData(path),
  }))
  .sort((a, b) => a.path.localeCompare(b.path))

function pathToRoute(path: string) {
  const parts = path.slice('./routes/'.length).split('/')
  const dirs = parts.slice(0, parts.length - 1).map(dirPattern)
  const file = filePattern(parts[parts.length - 1])

  return '/' + [...dirs, file].filter(s => s).join('/')
}

function dataModulePath(modulePath: string) {
  return modulePath.replace(/(.+)\.tsx$/, '$1.data.tsx')
}

function pageData(modulePath: string): (() => any) | undefined {
  const key = dataModulePath(modulePath)
  const module = pageDataModules[key]
  if (!module) return undefined
  return module.default
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

  it('maps path to data function path', () => {
    expect(dataModulePath('./routes/index.tsx')).toBe('./routes/index.data.tsx')
    expect(dataModulePath('./routes/[foo]/[bar].tsx')).toBe(
      './routes/[foo]/[bar].data.tsx',
    )
  })

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
