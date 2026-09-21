export const ROLES = {
  ADMIN: "ADMIN",
  VENDEDOR: "VENDEDOR",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function canManageUsers(role: Role): boolean {
  return role === ROLES.ADMIN;
}

export function canManageCatalog(role: Role): boolean {
  return role === ROLES.ADMIN;
}

export function canAdjustInventory(role: Role): boolean {
  return role === ROLES.ADMIN;
}
