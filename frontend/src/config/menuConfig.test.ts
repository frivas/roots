import { describe, it, expect } from 'vitest';
import { getMenuItems } from './menuConfig';

describe('getMenuItems', () => {
  it('returns items for teacher role', () => {
    const items = getMenuItems(['teacher']);
    const names = items.map(i => i.name);
    expect(names).toContain('Teaching');
  });

  it('returns items for admin role', () => {
    const items = getMenuItems(['administrator']);
    const names = items.map(i => i.name);
    expect(names).toContain('Administration');
  });

  it('returns items for parent role', () => {
    const items = getMenuItems(['parent']);
    const names = items.map(i => i.name);
    expect(names).toContain('My Children');
  });

  it('handles multiple roles without duplicating shared items', () => {
    const items = getMenuItems(['teacher', 'parent']);
    const names = items.map(i => i.name);
    // Common items like 'Home' should appear exactly once
    const homeCount = names.filter(n => n === 'Home').length;
    expect(homeCount).toBe(1);
    // Both role-specific items should be present
    expect(names).toContain('Teaching');
    expect(names).toContain('My Children');
  });

  it('returns base items when roles array is empty', () => {
    const items = getMenuItems([]);
    const names = items.map(i => i.name);
    // Common items always appear
    expect(names).toContain('Home');
    expect(names).toContain('Our School');
    expect(names).toContain('Communications');
  });

  it('filters Contribution Dashboard item for non-allowlisted email', () => {
    const items = getMenuItems([], 'unknown@example.com');
    const myDataItem = items.find(i => i.name === 'My Data');
    const children = myDataItem?.children ?? [];
    const contributionItem = children.find(c => c.name === 'Developer Contribution');
    expect(contributionItem).toBeUndefined();
  });

  it('keeps Contribution Dashboard item for an allowlisted contributor email', () => {
    const items = getMenuItems([], 'juan294@gmail.com');
    const myDataItem = items.find(i => i.name === 'My Data');
    const children = myDataItem?.children ?? [];
    const contributionItem = children.find(c => c.name === 'Developer Contribution');
    expect(contributionItem).toBeDefined();
  });
});
