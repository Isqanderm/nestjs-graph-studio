/**
 * Provider names that NestJS itself (or its official building blocks)
 * auto-registers, rather than something the application author wired up
 * intentionally. Flagging these as unused or duplicated is noise, not a
 * finding — confirmed via manual verification against a real, complex
 * NestJS app (Vendure), where they accounted for the large majority of
 * both categories' warnings:
 * - APP_GUARD/APP_INTERCEPTOR/APP_FILTER/APP_PIPE: registered via the
 *   `{ provide: APP_*, useClass }` pattern and consumed by Nest's core,
 *   never via ordinary constructor injection.
 * - ModuleRef/Reflector/REQUEST/INQUIRER/MetadataScanner: tokens Nest
 *   auto-registers per module or globally, independent of whether the
 *   application actually injects them anywhere.
 * Plugin/library option tokens are typically registered as
 * `Symbol(SOME_NAME)` (matched via the `Symbol(` name prefix produced by
 * SnapshotCollector's `safeTokenName()`), and are excluded the same way.
 */
const NEST_INTERNAL_TOKEN_NAMES = new Set([
  'APP_GUARD',
  'APP_INTERCEPTOR',
  'APP_FILTER',
  'APP_PIPE',
  'ModuleRef',
  'Reflector',
  'REQUEST',
  'INQUIRER',
  'MetadataScanner',
]);

export function isNestInternalToken(name: string): boolean {
  return NEST_INTERNAL_TOKEN_NAMES.has(name) || name.startsWith('Symbol(');
}
