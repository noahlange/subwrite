import type { ASTNode, FilterNode } from './parse/types';
import type { Filters, AnyObject } from './types';

import { NodeType } from './parse/types';
import { get, coerceFilterParam } from './utils';

function renderFilter(
  value: unknown,
  filter: FilterNode,
  data: AnyObject,
  ctx: Filters
): unknown {
  const fn = get(ctx, filter.name);
  if (fn && typeof fn === 'function') {
    let arg = coerceFilterParam(filter.value?.value);
    if (typeof arg === 'string') {
      // '"foo"' is a string, 'foo' is a reference
      arg = /^["].+["]$/.test(arg) ? arg.slice(1, -1) : get(data, arg.trim());
    }
    value = fn(value, arg ?? undefined);
  }
  return value;
}

export function render(nodes: ASTNode[], data: AnyObject = {}, ctx: Filters = {}): string {
  let result = '';
  for (const node of nodes) {
    switch (node.type) {
      case NodeType.LITERAL: {
        result += node.value;
        break;
      }
      case NodeType.GROUP:
      case NodeType.VAR: {
        result += node.filters
          .reduce(
            (value: unknown, filter) => renderFilter(value, filter, data, ctx),
            node.type === NodeType.VAR
              ? get(data, node.name) ?? `{${node.name}}`
              : render(node.value, data, ctx)
          )
          ?.toString();
      }
    }
  }

  return result.trim();
}
