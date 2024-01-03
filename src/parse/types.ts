import type { Token } from '../types';

export enum NodeType {
  LITERAL,
  GROUP,
  VAR,
  FILTER
}

export interface LiteralNode {
  type: NodeType.LITERAL;
  value: string;
}

export interface GroupNode {
  type: NodeType.GROUP;
  value: ASTNode[];
  filters: FilterNode[];
}

export interface VarNode {
  type: NodeType.VAR;
  name: string;
  filters: FilterNode[];
}

export interface FilterNode {
  type: NodeType.FILTER;
  name: string;
  value: LiteralNode | null;
}

export type ExpressionNode = FilterNode | VarNode;

export type ASTNode = LiteralNode | GroupNode | ExpressionNode;

export type ParseResult<T> = [number, T];

export interface ParseFunction {
  (current: number, tokens: Token[]): ParseResult<ASTNode>;
}
