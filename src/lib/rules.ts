import type Graph from 'graphology';

export type FRule = (graph: Graph, id: string) => boolean;

type RuleOperator = 'AND' | 'OR';
