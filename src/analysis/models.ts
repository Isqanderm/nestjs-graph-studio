/**
 * Data models for the static graph analysis (Issues) subsystem
 */

export type IssueSeverity = 'error' | 'warning' | 'info';

export type IssueCategory =
  | 'circular-dependency'
  | 'unused-provider'
  | 'scope-conflict'
  | 'duplicate-token';

export interface Issue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  nodeIds: string[];
  suggestedFix?: string;
}

export interface IssueReport {
  createdAt: string;
  issues: Issue[];
  summary: Record<IssueSeverity, number>;
}
