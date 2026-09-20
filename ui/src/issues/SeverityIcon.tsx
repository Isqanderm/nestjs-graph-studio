import { IssueSeverity } from '../types';

interface SeverityIconProps {
  severity: IssueSeverity;
  className?: string;
}

function SeverityIcon({ severity, className }: SeverityIconProps) {
  const commonProps = {
    className,
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (severity === 'error') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="7.5" x2="12" y2="13" />
        <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
      </svg>
    );
  }

  if (severity === 'warning') {
    return (
      <svg {...commonProps}>
        <path d="M12 4 L21.5 20 L2.5 20 Z" />
        <line x1="12" y1="10.5" x2="12" y2="15" />
        <circle cx="12" cy="17.5" r="0.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <circle cx="12" cy="7.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export default SeverityIcon;
