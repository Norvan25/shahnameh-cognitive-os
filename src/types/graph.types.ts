export type NodeLevel = 
  | 'awareness' 
  | 'server' 
  | 'brain' 
  | 'king' 
  | 'hero' 
  | 'shadow' 
  | 'saboteur' 
  | 'meta' 
  | 'principle';

export type NodeShape = 'hexagon' | 'circle' | 'diamond';

export type RelationshipType = 
  | 'heals' 
  | 'conflicts_with' 
  | 'corrupts' 
  | 'serves' 
  | 'integrates_with';

export interface CognitiveNode {
  id: string;
  nameEN: string;
  nameFA: string;
  level: NodeLevel;
  shape: NodeShape;
  role: string;
  strengths: string[];
  shadowDistortion?: string;
  dependencies?: string[];
  color: string;
  size: number;
}

export interface Connection {
  source: string;
  target: string;
  type: RelationshipType;
}

export interface GraphData {
  nodes: CognitiveNode[];
  connections: Connection[];
}
