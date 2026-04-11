import { describe, it, expect } from 'vitest';
import { GitHubContributorsService } from './GitHubContributorsService';

describe('GitHubContributorsService', () => {
  it('isValidContributor returns true for a known contributor email', () => {
    expect(GitHubContributorsService.isValidContributor('juan294@gmail.com')).toBe(true);
  });

  it('isValidContributor returns false for an unknown email', () => {
    expect(GitHubContributorsService.isValidContributor('nobody@unknown.com')).toBe(false);
  });

  it('getContributorStats returns stats object for known contributor', () => {
    const stats = GitHubContributorsService.getContributorStats('juan294@gmail.com');
    expect(stats).not.toBeNull();
    expect(typeof stats!.totalCommits).toBe('number');
    expect(stats!.totalCommits).toBeGreaterThan(0);
  });

  it('getContributorStats returns null for unknown contributor', () => {
    const stats = GitHubContributorsService.getContributorStats('nobody@unknown.com');
    expect(stats).toBeNull();
  });

  it('getAllContributorEmails returns a non-empty array of strings', () => {
    const emails = GitHubContributorsService.getAllContributorEmails();
    expect(Array.isArray(emails)).toBe(true);
    expect(emails.length).toBeGreaterThan(0);
    emails.forEach(email => {
      expect(typeof email).toBe('string');
    });
  });

  it('getContributorDisplayName falls back to email prefix for unknown email', () => {
    const result = GitHubContributorsService.getContributorDisplayName('testuser@example.com');
    expect(result).toBe('testuser');
  });

  it('addContributor adds an entry observable via isValidContributor', () => {
    const newEmail = 'newcontributor@test.com';
    expect(GitHubContributorsService.isValidContributor(newEmail)).toBe(false);

    GitHubContributorsService.addContributor(newEmail, {
      totalCommits: 5,
      linesAdded: 100,
      netLines: 80,
      developmentDays: 3,
      peakActivityDays: [],
      topModifiedFiles: [],
      timelineData: []
    });

    expect(GitHubContributorsService.isValidContributor(newEmail)).toBe(true);
  });
});
