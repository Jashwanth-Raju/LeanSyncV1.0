import type { WhiteboardEdge, WhiteboardNode } from "../nodes/NodeTypes";

export interface LeanBoardSnapshot {
  id: string;
  name: string;
  nodes: WhiteboardNode[];
  edges: WhiteboardEdge[];
  updatedAt: number;
}

export interface LeanProject {
  id: string;
  name: string;
  organizationId: string;
  boards: LeanBoardSnapshot[];
}
