import type { Token } from '../types';
import type { ASTNode, FilterNode, GroupNode, ParseResult, VarNode } from './types';

import { parseFilter } from './filter';
import { parseToken } from './token';
import { NodeType } from './types';

import { TOKEN } from '../tokenize';

export function parseExpression(i: number, tokens: Token[]): ParseResult<ASTNode> {
  // first token is an opening brace
  const isVarNode = tokens[i].type === TOKEN.VAR_START;
  const end = isVarNode ? TOKEN.VAR_END : TOKEN.GROUP_END;

  const node: VarNode | GroupNode = isVarNode
    ? // if we're parsing {blah}, 'blah' is token i+1. get the name and move on.
      { type: NodeType.VAR, name: tokens[++i].value, filters: [] }
    : // otherwise, we're about to start a nested parse.
      { type: NodeType.GROUP, value: [], filters: [] };

  // if this is a group, we've advanced to at the opening bracket (i); if a var we're at i+1
  // (i.e., the name).
  let token = tokens[++i];

  // consume tokens until we reach the end of the expression
  while (token && token.type !== end) {
    switch (token.type) {
      case TOKEN.FILTER: {
        let filters: FilterNode[];
        [i, filters] = parseFilter(i, tokens, end);
        node.filters.push(...filters);
        return [i, node];
      }
      default: {
        // only parse recursively if we're in a group
        if (node.type === NodeType.GROUP) {
          let content: ASTNode;
          [i, content] = parseToken(i, tokens);
          node.value.push(content);
          break;
        }
      }
    }
    token = tokens[i];
  }
  return [i + 1, node];
}
