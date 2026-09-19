import { Injectable } from '@nestjs/common';
import { GraphSnapshot } from '../snapshot/models';
import { Issue, IssueReport, IssueSeverity } from './models';
import { findCircularDependencies } from './checks/circular-dependencies';
import { findUnusedProviders } from './checks/unused-providers';
import { findScopeConflicts } from './checks/scope-conflicts';
import { findDuplicateTokens } from './checks/duplicate-tokens';

function summarize(issues: Issue[]): Record<IssueSeverity, number> {
  const summary: Record<IssueSeverity, number> = { error: 0, warning: 0, info: 0 };
  for (const issue of issues) {
    summary[issue.severity]++;
  }
  return summary;
}

@Injectable()
export class GraphAnalyzer {
  analyze(snapshot: GraphSnapshot): IssueReport {
    const issues: Issue[] = [
      ...findCircularDependencies(snapshot),
      ...findUnusedProviders(snapshot),
      ...findScopeConflicts(snapshot),
      ...findDuplicateTokens(snapshot),
    ];

    return {
      createdAt: new Date().toISOString(),
      issues,
      summary: summarize(issues),
    };
  }
}
