import { Case } from './index.js'

declare module './index.js' {
  export interface Case<T extends string = string> {
    type: T
  }
}

/** Create a check function for a case label */
export const check =
  <T extends string>(type: T) =>
  <C extends Case>(caseValue: C): caseValue is Extract<C, Case<T>> =>
    caseValue.type === type

/** Return case as Case<T> if type matches, or else return undefined */
export const as = <C extends Case, T extends Case['type']>(
  caseValue: C,
  type: T,
): Extract<C, Case<T>> | undefined =>
  caseValue.type === type ? (caseValue as Extract<C, Case<T>>) : undefined
