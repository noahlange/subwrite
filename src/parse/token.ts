import type { Token, TokenType } from '../types';
import type { ASTNode, ParseFunction, ParseResult } from './types';

import { TOKEN } from '../tokenize';
import { parseExpression } from './expression';
import { parseLiteral } from './literal';

const fns: Partial<Record<TokenType, ParseFunction>> = {
  [TOKEN.GROUP_START]: parseExpression,
  [TOKEN.VAR_START]: parseExpression,
  [TOKEN.LITERAL]: parseLiteral
};

export function parseToken(current: number, tokens: Token[]): ParseResult<ASTNode> {
  const { type, value } = tokens[current];
  const parse = fns[type] ?? null;
  if (parse !== null) {
    return parse(current, tokens);
  } else {
    throw new SyntaxError(`Failed to parse token ${type.toString()} with value "${value}."`);
  }
}
