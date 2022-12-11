import type { Token } from '../types';
import type { ASTNode, ParseResult } from './types';

import { parseToken } from './token';

export function parse(tokens: Token[]): ASTNode[] {
  let [current, node]: ParseResult<ASTNode | null> = [0, null];
  const nodes: ASTNode[] = [];
  while (current < tokens.length) {
    [current, node] = parseToken(current, tokens);
    nodes.push(node);
  }
  return nodes;
}
