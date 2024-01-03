import { describe, test } from 'node:test';
import { deepEqual } from 'node:assert';
import { set } from './utils';

describe('set()', () => {
  test('sets top-level values', () => {
    deepEqual(set({ foo: 'bar' }, 'foo', 'baz'), { foo: 'baz' });
  });

  test('set nested values', () => {
    deepEqual(
      set({ foo: { bar: 'baz' } }, 'foo.bar', { baz: 'bat' }),
      { foo: { bar: { baz: 'bat' } } }
    );
  });
});
