export interface InlineTextToken {
  type: 'text' | 'code';
  value: string;
}

// Matches either a double-quoted identifier (quotes dropped, inner text kept)
// or a bare PascalCase identifier (at least two capitals, e.g. ConfigModule) —
// which is how class/module names appear in issue descriptions
// (src/analysis/checks/*.ts), quoted in some checks and bare in others.
const INLINE_CODE_PATTERN = /"([A-Za-z][\w]*)"|\b([A-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*)\b/g;

export function tokenizeInlineCode(text: string): InlineTextToken[] {
  const tokens: InlineTextToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_CODE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, index) });
    }
    tokens.push({ type: 'code', value: match[1] ?? match[2] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
}
