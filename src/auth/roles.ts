export enum Role {
  Admin = 'admin',
}

const KNOWN_ROLES = new Set<string>(Object.values(Role))

export function toRoles(claimed: readonly string[]): Role[] {
  return [...new Set(claimed)].filter((role): role is Role => KNOWN_ROLES.has(role))
}
