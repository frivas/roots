import { describe, it, expect } from 'vitest';
import { getMenuItems } from './menuConfig';
import { isRegisteredRoute } from './routes';

describe('getMenuItems', () => {
  it('does not expose role-only destinations until those pages are implemented', () => {
    const items = getMenuItems(['teacher', 'parent']);
    const names = items.map(i => i.name);

    expect(names).not.toContain('Teaching');
    expect(names).not.toContain('My Children');
    expect(names.filter(n => n === 'Home')).toHaveLength(1);
  });

  it('returns base items when roles array is empty', () => {
    const items = getMenuItems([]);
    const names = items.map(i => i.name);
    // Common items always appear
    expect(names).toContain('Home');
    expect(names).toContain('Our School');
    expect(names).toContain('Communications');
  });

  it('does not expose the internal contribution dashboard to any client user', () => {
    const items = getMenuItems([], 'juan294@gmail.com');
    const myDataItem = items.find(i => i.name === 'My Data');
    const children = myDataItem?.children ?? [];
    const contributionItem = children.find(c => c.name === 'Developer Contribution');
    expect(contributionItem).toBeUndefined();
  });

  it('only exposes destinations registered by the application router', () => {
    const items = getMenuItems(
      ['student', 'parent', 'teacher', 'administrator'],
      'user@example.com',
    );
    const destinations = items.flatMap(item =>
      item.children?.flatMap(child => [
        ...(child.href ? [child.href] : []),
        ...(child.children?.flatMap(grandchild => grandchild.href ? [grandchild.href] : []) ?? []),
      ]) ?? (item.href ? [item.href] : []),
    );

    expect(destinations.length).toBeGreaterThan(0);
    expect(destinations.every(isRegisteredRoute)).toBe(true);
  });
});
