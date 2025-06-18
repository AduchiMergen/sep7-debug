import { describe, it, expect } from 'vitest';
import { formatSomething } from './formatters';

describe('formatters', () => {
  describe('formatSomething', () => {
    it('should convert a number to a string', () => {
      expect(formatSomething(123)).toBe('123');
    });

    it('should convert a boolean to a string', () => {
      expect(formatSomething(true)).toBe('true');
      expect(formatSomething(false)).toBe('false');
    });

    it('should return an existing string as is', () => {
      expect(formatSomething('hello')).toBe('hello');
    });

    it('should convert null to "null"', () => {
      expect(formatSomething(null)).toBe('null');
    });

    it('should convert undefined to "undefined"', () => {
      expect(formatSomething(undefined)).toBe('undefined');
    });

    it('should convert an object to its string representation', () => {
      expect(formatSomething({ a: 1 })).toBe('[object Object]');
    });

    it('should convert an array to its string representation', () => {
      expect(formatSomething([1, 2, 3])).toBe('1,2,3');
    });
  });
});
