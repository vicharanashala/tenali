import { describe, it, expect } from 'vitest';
import { TILES } from './features/tiles.js';
import { resolveTextToNumber } from './components/Numbers1To10/phoneticResolver.js';
import { NUMBERS_INFO } from './components/Numbers1To10/numbers1To10Data.js';

describe('Numbers 1 to 10 Module & Navigation Targets', () => {
  it('registers the numbers-1-to-10 tile in TILES', () => {
    const tile = TILES.find((t) => t.key === 'numbers-1-to-10');
    expect(tile).toBeDefined();
    expect(tile.key).toBe('numbers-1-to-10');
    expect(tile.category).toBe('number-foundations');
  });

  it('contains valid configuration for all numbers 1 to 10', () => {
    expect(NUMBERS_INFO).toBeDefined();
    expect(NUMBERS_INFO.length).toBe(10);
    for (let i = 1; i <= 10; i++) {
      const entry = NUMBERS_INFO.find((item) => item.num === i);
      expect(entry).toBeDefined();
      expect(entry.word).toBeTruthy();
    }
  });

  it('correctly resolves spoken number words to integers', () => {
    expect(resolveTextToNumber('1')).toBe(1);
    expect(resolveTextToNumber('one')).toBe(1);
    expect(resolveTextToNumber('two')).toBe(2);
    expect(resolveTextToNumber('three')).toBe(3);
    expect(resolveTextToNumber('four')).toBe(4);
    expect(resolveTextToNumber('five')).toBe(5);
    expect(resolveTextToNumber('six')).toBe(6);
    expect(resolveTextToNumber('seven')).toBe(7);
    expect(resolveTextToNumber('eight')).toBe(8);
    expect(resolveTextToNumber('nine')).toBe(9);
    expect(resolveTextToNumber('ten')).toBe(10);
  });

  it('resolves common phonetic and multilingual variations', () => {
    expect(resolveTextToNumber('won')).toBe(1);
    expect(resolveTextToNumber('to')).toBe(2);
    expect(resolveTextToNumber('too')).toBe(2);
    expect(resolveTextToNumber('for')).toBe(4);
    expect(resolveTextToNumber('ate')).toBe(8);
    expect(resolveTextToNumber('ek')).toBe(1);
    expect(resolveTextToNumber('do')).toBe(2);
    expect(resolveTextToNumber('teen')).toBe(3);
    expect(resolveTextToNumber('chaar')).toBe(4);
    expect(resolveTextToNumber('paanch')).toBe(5);
  });
});
