import type { Token } from '../types';

export interface LiteralNode {
  type: 'Literal';
  value: string;
}

export interface GroupNode {
  type: 'Group';
  value: ASTNode[];
  filters: FilterNode[];
}

export interface VarNode {
  type: 'Var';
  name: string;
  filters: FilterNode[];
}

export interface FilterNode {
  type: 'Filter';
  name: string;
  value: LiteralNode | null;
}

export type ExpressionNode = FilterNode | VarNode;

export type ASTNode = LiteralNode | GroupNode | ExpressionNode;

export type ParseResult<T> = [number, T];

export interface ParseFunction {
  (current: number, tokens: Token[]): ParseResult<ASTNode>;
}
