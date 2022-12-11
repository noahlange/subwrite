import { describe, expect, test } from '@jest/globals';
import { set } from './utils';

describe('set()', () => {
  test('sets top-level values', () => {
    expect(set({ foo: 'bar' }, 'foo', 'baz')).toStrictEqual({ foo: 'baz' });
  });

  test('set nested values', () => {
    expect(set({ foo: { bar: 'baz' } }, 'foo.bar', { baz: 'bat' })).toStrictEqual({
      foo: { bar: { baz: 'bat' } }
    });
  });
});
