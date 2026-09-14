import { describe, expect, it } from 'vitest';
import { getClerkRoles } from './clerkRoles';

describe('getClerkRoles', () => {
  it('reads and filters the canonical plural roles field', () => {
    expect(getClerkRoles({ roles: ['teacher', 'invalid', 'administrator'] }))
      .toEqual(['teacher', 'administrator']);
  });

  it('supports the legacy singular role field during migration', () => {
    expect(getClerkRoles({ role: 'parent' })).toEqual(['parent']);
  });

  it('combines both fields without duplicate roles', () => {
    expect(getClerkRoles({ role: 'teacher', roles: ['teacher', 'student'] }))
      .toEqual(['teacher', 'student']);
  });

  it('prefers the canonical plural field when legacy metadata conflicts', () => {
    expect(getClerkRoles({ role: 'teacher', roles: ['parent'] }))
      .toEqual(['parent', 'teacher']);
  });

  it('returns no roles for malformed metadata', () => {
    expect(getClerkRoles({ role: 42, roles: 'teacher' })).toEqual([]);
    expect(getClerkRoles(undefined)).toEqual([]);
  });
});
