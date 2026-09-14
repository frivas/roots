import type { Role } from '../config/menuConfig';

const validRoles = new Set<Role>([
  'student',
  'parent',
  'teacher',
  'administrator',
]);

const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && validRoles.has(value as Role);

export const getClerkRoles = (
  publicMetadata: Record<string, unknown> | null | undefined,
): Role[] => {
  if (!publicMetadata) return [];

  const pluralRoles = Array.isArray(publicMetadata.roles)
    ? publicMetadata.roles.filter(isRole)
    : [];
  const singularRole = isRole(publicMetadata.role) ? [publicMetadata.role] : [];

  return [...new Set([...pluralRoles, ...singularRole])];
};
