import type { Token, TokenType } from './types';
import { segmentize } from './utils';

export enum TOKEN {
  VAR_START = 'VAR_START',
  VAR_END = 'VAR_END',
  GROUP_START = 'GROUP_START',
  GROUP_END = 'GROUP_END',
  LITERAL = 'LITERAL',
  FILTER = 'FILTER',
  PARAM = 'PARAM'
}

const characters: Record<string, TokenType> = {
  '{': TOKEN.VAR_START,
  '}': TOKEN.VAR_END,
  '[': TOKEN.GROUP_START,
  ']': TOKEN.GROUP_END,
  '=': TOKEN.PARAM,
  '|': TOKEN.FILTER
};

export function tokenize(input: string): Token[] {
  function appendText(value: string, tokens: Token[]): [string, Token[]] {
    // skip whitespace-only nodes
    return value.trim()
      ? // ...but don't trim regular ones
        ['', tokens.concat({ type: TOKEN.LITERAL, value })]
      : [value, tokens];
  }

  // use Intl's Segmenter to avoid UTF problems
  let [value, tokens]: [string, Token[]] = ['', []];
  for (const segment of segmentize(input)) {
    if (segment in characters) {
      [value, tokens] = appendText(value, tokens);
      tokens.push({ type: characters[segment], value: segment });
    } else {
      value += segment;
    }
  }
  // add any any trailing characters
  [value, tokens] = appendText(value, tokens);
  return tokens;
}
