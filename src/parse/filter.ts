import type { Token, TokenType } from '../types';

import type { FilterNode, LiteralNode, ParseResult } from './types';

import { parseLiteral } from './literal';
import { TOKEN } from '../tokenize';

export function parseFilter(
  i: number,
  tokens: Token[],
  end: TokenType
): ParseResult<FilterNode[]> {
  let value: LiteralNode | string | null = null;
  // advance to whatever comes after the filter name; either `|`, `=` or an end char.
  let token = tokens[++i];
  // i is the pipe, i+1 is the filter name
  let node: FilterNode = { type: 'Filter', name: token.value, value };

  const filters: FilterNode[] = [];

  while (token && token.type !== end) {
    switch (token.type) {
      // new filter starts
      case TOKEN.FILTER: {
        filters.push(node);
        value = null;
        const [, name] = parseLiteral(++i, tokens);
        node = { type: 'Filter', name: name.value.trim(), value };
        break;
      }
      // filter name
      case TOKEN.LITERAL: {
        if (token.value.trim()) {
          value = token.value;
        }
        break;
      }
      // "="
      case TOKEN.PARAM: {
        // get the value of the filter arg
        [, value] = parseLiteral(++i, tokens);
        node.value = value;
        break;
      }
    }
    token = tokens[++i];
  }
  return [i + 1, [...filters, node]];
}
