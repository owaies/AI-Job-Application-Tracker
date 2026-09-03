import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const source = readFileSync(resolve('src/App.tsx'), 'utf8')

test('auth bootstrap restores a persisted token before protected-route decisions', () => {
  assert.match(source, /useState\(\(\) => localStorage\.getItem\(TOKEN_KEY\)\)/)
  assert.match(source, /const \[authInitializing, setAuthInitializing\]/)
  assert.match(source, /api\.me\(token\)/)
  assert.match(source, /if \(authInitializing\) return/)
  assert.match(source, /if \(!token \|\| !user\)/)
})

test('bootstrap only clears the token for an actual 401 response', () => {
  assert.match(source, /err instanceof ApiError && err\.status === 401/)
  assert.match(source, /localStorage\.removeItem\(TOKEN_KEY\)/)
  assert.doesNotMatch(source, /catch\(\(\) => \{ localStorage\.removeItem\(TOKEN_KEY\)/)
})
