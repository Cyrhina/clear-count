import type { Employee } from '@ops/types/domain'

export function fullName(e: Employee) {
  return `${e.personal.firstName} ${e.personal.lastName}`
}
