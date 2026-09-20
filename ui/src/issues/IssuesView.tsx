import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchIssues } from '../api';
import { useStore } from '../store';
import { Issue, IssueSeverity } from '../types';
import { Button } from '../components/ui';
import SeverityIcon from './SeverityIcon';
import InlineCodeText from './InlineCodeText';
import styles from './IssuesView.module.css';

const SEVERITY_ORDER: IssueSeverity[] = ['error', 'warning', 'info'];

const CATEGORY_LABELS: Record<Issue['category'], string> = {
  'circular-dependency': 'Circular Dependencies',
  'unused-provider': 'Unused Providers',
  'scope-conflict': 'Scope Conflicts',
  'duplicate-token': 'Duplicate Tokens',
};

function IssuesView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const issues = useStore((state) => state.issues);
  const setIssues = useStore((state) => state.setIssues);
  const setFocusNodeIds = useStore((state) => state.setFocusNodeIds);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues()
      .then((report) => {
        setIssues(report);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setIssues]);

  const handleShowInGraph = (nodeIds: string[]) => {
    setFocusNodeIds(nodeIds);
    navigate('/');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading issues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Failed to load issues: {error}</div>
      </div>
    );
  }

  const allIssues = issues?.issues ?? [];
  const summary = issues?.summary ?? { error: 0, warning: 0, info: 0 };

  const grouped = allIssues.reduce<Record<string, Issue[]>>((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {});

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <h2>Issues</h2>
        <p>Structural problems detected in your dependency injection graph</p>
      </div>

      <div className={styles.summaryBar} data-testid="issues-summary">
        {SEVERITY_ORDER.map((severity) => (
          <div key={severity} className={styles.summaryItem} data-severity={severity}>
            <SeverityIcon severity={severity} className={styles.summaryIcon} />
            <span>
              {severity}: {summary[severity]}
            </span>
          </div>
        ))}
      </div>

      {allIssues.length === 0 ? (
        <div className={styles.emptyState} data-testid="issues-empty-state">
          No issues detected. Your dependency graph looks clean.
        </div>
      ) : (
        <div className={styles.issueGroups} data-testid="issues-list">
          {Object.entries(grouped).map(([category, categoryIssues]) => (
            <div key={category} className={styles.issueGroup}>
              <h3 className={styles.issueGroupTitle}>
                {CATEGORY_LABELS[category as Issue['category']]} ({categoryIssues.length})
              </h3>
              {categoryIssues.map((issue) => (
                <div key={issue.id} className={styles.issueItem} data-testid="issue-item">
                  <div className={styles.issueItemHeader}>
                    <span className={styles.severityLabel} data-severity={issue.severity}>
                      <SeverityIcon severity={issue.severity} className={styles.severityIcon} />
                      {issue.severity.toUpperCase()}
                    </span>
                    <span className={styles.issueTitle}>{issue.title}</span>
                  </div>
                  <p className={styles.issueDescription}>
                    <InlineCodeText text={issue.description} />
                  </p>
                  {issue.suggestedFix && (
                    <p className={styles.issueSuggestedFix}>
                      💡 <InlineCodeText text={issue.suggestedFix} />
                    </p>
                  )}
                  {issue.nodeIds.length > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleShowInGraph(issue.nodeIds)}
                    >
                      Show in graph
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IssuesView;
