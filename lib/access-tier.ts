// SERVER-ONLY module — imports node:crypto and reads secret env vars.
// Never import this from a client component.
import { createHash, timingSafeEqual } from 'node:crypto'
import type { AccessTier } from '@/lib/types'

export type PasswordClass = 'mod' | 'panel-admin' | 'real-admin' | 'unknown'

// Timing-safe string comparison: hash both sides to fixed-length digests so
// timingSafeEqual never throws on length mismatch and comparison time does
// not depend on where the strings first differ.
export function secureCompare(a: string, b: string) {
  const digestA = createHash('sha256').update(a).digest()
  const digestB = createHash('sha256').update(b).digest()
  return timingSafeEqual(digestA, digestB)
}

// Classify the presented password against the three server-side credentials.
// The order is deliberate and MUST stay mod-first: if an operator ever
// misconfigures MOD_PASSWORD to collide with an admin credential, the
// collision resolves to the LOWER privilege (fail closed), never the higher.
// With distinct values (the normal case) the order is unobservable.
export function classifyPassword(password: string): PasswordClass {
  if (!password) {
    return 'unknown'
  }

  const modPassword = process.env.MOD_PASSWORD
  const panelLogin = process.env.PANEL_LOGIN_PASSWORD
  const realAdmin = process.env.PALWORLD_REAL_ADMIN_PASSWORD

  if (modPassword && secureCompare(password, modPassword)) {
    return 'mod'
  }

  if (panelLogin && secureCompare(password, panelLogin)) {
    return 'panel-admin'
  }

  if (realAdmin && secureCompare(password, realAdmin)) {
    return 'real-admin'
  }

  return 'unknown'
}

export function tierForClass(passwordClass: PasswordClass): AccessTier | 'invalid' {
  switch (passwordClass) {
    case 'mod':
      return 'mod'
    case 'panel-admin':
    case 'real-admin':
      return 'admin'
    default:
      return 'invalid'
  }
}
