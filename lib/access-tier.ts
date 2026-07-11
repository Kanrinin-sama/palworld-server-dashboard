// Panel access classification.
//
// Single-password model: one admin password held server-side in the PANEL_PASSWORD
// env var. The browser submits it; the server compares it in constant time and, on
// a match, the proxy swaps in the game's real REST admin password — so the real
// credential never reaches the client. There is one tier (admin); the `mod` case
// exists in the type only so the multi-tier upgrade is a drop-in replacement of
// this file.
import { timingSafeEqual } from 'node:crypto'
import type { AccessTier } from '@/lib/types'

export type PasswordClass = 'admin' | 'mod' | 'unknown'

export function classifyPassword(password: string): PasswordClass {
  const expected = process.env.PANEL_PASSWORD ?? ''
  if (!expected || !password) return 'unknown' // fail closed when unconfigured
  const a = Buffer.from(password)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return 'unknown'
  return timingSafeEqual(a, b) ? 'admin' : 'unknown'
}

export function tierForClass(passwordClass: PasswordClass): AccessTier | 'invalid' {
  switch (passwordClass) {
    case 'admin':
      return 'admin'
    case 'mod':
      return 'mod'
    default:
      return 'invalid'
  }
}
