import type { Filters, AnyObject } from './types';

import { render } from './render';
import { tokenize } from './tokenize';
import { parse } from './parse';

export function sub(text: string, data: AnyObject = {}, ctx?: Filters): string {
  try {
    return render(parse(tokenize(text)), data, ctx);
  } catch (e) {
    console.error(`Failed to sub string "${text}":`, e);
    return '';
  }
}

export function subThrows(text: string, data: AnyObject = {}, ctx?: Filters): string {
  return render(parse(tokenize(text)), data, ctx);
}
