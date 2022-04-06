import { Case } from './index.js'

declare module './index.js' {
  export interface Case<T extends string = string> {
    type: T
  }
}

export const check =
  <T extends string>(type: T) =>
  <C extends Case>(caseValue: C): caseValue is Extract<C, Case<T>> =>
    caseValue.type === type
