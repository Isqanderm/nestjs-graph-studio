import { describe, it, expect } from 'vitest';
import { tokenizeInlineCode } from '../inlineCode';

describe('tokenizeInlineCode', () => {
  it('returns a single text token for prose with no identifiers', () => {
    expect(tokenizeInlineCode('This is a plain sentence.')).toEqual([
      { type: 'text', value: 'This is a plain sentence.' },
    ]);
  });

  it('extracts a double-quoted identifier and drops the quotes', () => {
    expect(tokenizeInlineCode('"AccessTokenGuard" was registered as a provider.')).toEqual([
      { type: 'code', value: 'AccessTokenGuard' },
      { type: 'text', value: ' was registered as a provider.' },
    ]);
  });

  it('extracts bare PascalCase identifiers without quotes', () => {
    expect(
      tokenizeInlineCode('These modules form a cycle: ConfigModule, TypeOrmCoreModule.')
    ).toEqual([
      { type: 'text', value: 'These modules form a cycle: ' },
      { type: 'code', value: 'ConfigModule' },
      { type: 'text', value: ', ' },
      { type: 'code', value: 'TypeOrmCoreModule' },
      { type: 'text', value: '.' },
    ]);
  });

  it('does not treat a single-capital sentence-starting word as an identifier', () => {
    expect(tokenizeInlineCode('Consider splitting this module.')).toEqual([
      { type: 'text', value: 'Consider splitting this module.' },
    ]);
  });

  it('handles multiple quoted identifiers in one string', () => {
    expect(tokenizeInlineCode('Detected 7 "UserRepository" providers, perhaps "AppModule" too')).toEqual([
      { type: 'text', value: 'Detected 7 ' },
      { type: 'code', value: 'UserRepository' },
      { type: 'text', value: ' providers, perhaps ' },
      { type: 'code', value: 'AppModule' },
      { type: 'text', value: ' too' },
    ]);
  });

  it('returns an empty array for an empty string', () => {
    expect(tokenizeInlineCode('')).toEqual([]);
  });

  it('leaves a quoted multi-word phrase untouched, quotes and all', () => {
    // Real case from duplicate-tokens.ts: quotes are also used for plain
    // prose emphasis, not just identifiers — only a single-token quoted
    // string should become code.
    expect(
      tokenizeInlineCode('a common source of "two different instances" confusion')
    ).toEqual([
      { type: 'text', value: 'a common source of "two different instances" confusion' },
    ]);
  });
});
