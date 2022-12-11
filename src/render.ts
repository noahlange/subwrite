import type { ASTNode } from './parse/types';
import type { Filters, AnyObject } from './types';

import { get, coerceFilterParam } from './utils';

export function render(nodes: ASTNode[], data: AnyObject = {}, ctx: Filters = {}): string {
  let result = '';
  for (const node of nodes) {
    switch (node.type) {
      case 'Literal': {
        result += node.value;
        break;
      }
      case 'Group':
      case 'Var': {
        let value =
          node.type === 'Var'
            ? get(data, node.name) ?? `{${node.name}}`
            : render(node.value, data, ctx);

        for (const filter of node.filters) {
          const fn = get(ctx, filter.name);
          if (fn && typeof fn === 'function') {
            const arg = coerceFilterParam(filter.value?.value);
            value = fn(value, arg);
          }
        }
        result += value;
      }
    }
  }
  return result.trim();
}
