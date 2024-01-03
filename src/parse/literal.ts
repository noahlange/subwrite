import type { Token } from '../types';
import type { LiteralNode, ParseResult } from './types';

import { NodeType } from './types';

export function parseLiteral(i: number, tokens: Token[]): ParseResult<LiteralNode> {
  return [i + 1, { type: NodeType.LITERAL, value: tokens[i].value }];
}
