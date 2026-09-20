import { describe, it, expect } from 'vitest';
import { isModuleSelfRegistration } from '../GraphView';

describe('isModuleSelfRegistration', () => {
  it('is true for a PROVIDER whose name equals its own module name', () => {
    expect(
      isModuleSelfRegistration({ type: 'PROVIDER', label: 'HealthCheckModule', module: 'HealthCheckModule' })
    ).toBe(true);
  });

  it('is false for a PROVIDER in a different-named module', () => {
    expect(
      isModuleSelfRegistration({ type: 'PROVIDER', label: 'UsersService', module: 'UsersModule' })
    ).toBe(false);
  });

  it('is false for a MODULE node, even if oddly self-named', () => {
    expect(
      isModuleSelfRegistration({ type: 'MODULE', label: 'HealthCheckModule', module: 'HealthCheckModule' })
    ).toBe(false);
  });

  it('is false for a CONTROLLER node', () => {
    expect(
      isModuleSelfRegistration({ type: 'CONTROLLER', label: 'HealthCheckModule', module: 'HealthCheckModule' })
    ).toBe(false);
  });

  it('is false when module is undefined', () => {
    expect(isModuleSelfRegistration({ type: 'PROVIDER', label: 'OrphanService' })).toBe(false);
  });

  it('is false when name and module merely share a substring', () => {
    expect(
      isModuleSelfRegistration({ type: 'PROVIDER', label: 'HealthService', module: 'HealthCheckModule' })
    ).toBe(false);
  });
});
