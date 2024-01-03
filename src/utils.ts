import type { AnyObject } from './types';

/**
 * I know there's a way to type this correctly using template strings but I have
 * neither the time, the patience or the desire to do it. Or in this case, the
 * need.
 */
export function get<T extends AnyObject>(obj: T, path: string): unknown | null {
  let res: Record<string, any> | null = obj;
  for (const part of path.split('.')) {
    res = res[part] ?? null;
    if (res === null) {
      break;
    }
  }
  return res;
}

export function set<T extends AnyObject>(object: T, path: string, value: unknown): T {
  const parts = path.split('.');
  const prop = parts.pop()!;
  let next: Record<string, any> = object;
  for (const part of parts) {
    next = next[part] ??= {};
  }
  next[prop] = value;
  return object;
}

const segmenter = new Intl.Segmenter();
const booleans: unknown[] = ['true', 'false'];

export function segmentize(str: string): string[] {
  return Array.from(segmenter.segment(str), s => s.segment);
}

export function coerceFilterParam(value?: string): unknown | null {
  if (typeof value === 'object') {
    return value;
  } else {
    let res: unknown | null = value;
    // boolean
    res = booleans.includes(res) ? res === 'true' : res;
    // number
    res = res && !isNaN(+res) ? +res : res;
    return res;
  }
}
