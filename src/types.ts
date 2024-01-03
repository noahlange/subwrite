import type { TOKEN } from './tokenize';

export interface Token {
  type: TokenType;
  value: string;
}

export interface FilterFunction {
  (data: any, ...args: any[]): number | string | null | boolean | AnyObject;
}

export type TokenType = typeof TOKEN[keyof typeof TOKEN];

export type AnyObject = { [key: string | number | symbol]: unknown };

export interface Filters {
  [key: string | number | symbol]: FilterFunction;
}
