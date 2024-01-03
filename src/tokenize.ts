import type { Token, TokenType } from './types';
import { segmentize } from './utils';

export enum TOKEN {
  VAR_START,
  VAR_END,
  GROUP_START,
  GROUP_END,
  LITERAL,
  FILTER,
  PARAM
}

export function tokenize(input: string, characters: Record<string, TokenType>): Token[] {
  // use Intl's Segmenter to avoid UTF problems
  let [value, tokens]: [string, Token[]] = ['', []];
  for (const segment of segmentize(input)) {
    if (segment in characters) {
      tokens.push(
        { type: TOKEN.LITERAL, value },
        { type: characters[segment], value: segment }
      );
      value = '';
    } else {
      value += segment;
    }
  }
  // add any any trailing characters
  tokens.push({ type: TOKEN.LITERAL, value });
  return tokens;
}
