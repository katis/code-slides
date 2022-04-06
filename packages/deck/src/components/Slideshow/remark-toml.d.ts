import 'mdast'

declare module 'mdast' {
  interface FrontmatterContentMap {
    toml: { type: 'toml'; value: import('@iarna/toml').JsonMap }
  }
}
