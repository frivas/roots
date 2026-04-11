import { describe, it, expect } from 'vitest';
import tutorMockData from './TutorMockData';

describe('tutorMockData', () => {
  it('has a defined id field', () => {
    expect(tutorMockData.id).toBeDefined();
    expect(typeof tutorMockData.id).toBe('string');
    expect(tutorMockData.id.length).toBeGreaterThan(0);
  });

  it('has an email that contains @', () => {
    expect(tutorMockData.email).toContain('@');
  });

  it('has numeric stats fields', () => {
    expect(typeof tutorMockData.stats.classesTaught).toBe('number');
    expect(typeof tutorMockData.stats.studentsMentored).toBe('number');
    expect(tutorMockData.stats.classesTaught).toBeGreaterThan(0);
    expect(tutorMockData.stats.studentsMentored).toBeGreaterThan(0);
  });

  it('has a course field', () => {
    expect(tutorMockData.currentCourse).toBeDefined();
    expect(typeof tutorMockData.currentCourse.course).toBe('string');
    expect(tutorMockData.currentCourse.course.length).toBeGreaterThan(0);
  });
});
