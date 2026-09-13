import { isSafeRedirect } from './redirect.utils';

describe('isSafeRedirect', () => {
  it('accepts in-app absolute paths', () => {
    expect(isSafeRedirect('/app')).toBe(true);
    expect(isSafeRedirect('/admin/students?x=1')).toBe(true);
  });

  it('rejects external, protocol-relative, relative and empty values', () => {
    expect(isSafeRedirect('https://evil.example')).toBe(false);
    expect(isSafeRedirect('//evil.example')).toBe(false);
    expect(isSafeRedirect('app')).toBe(false);
    expect(isSafeRedirect('')).toBe(false);
    expect(isSafeRedirect(null)).toBe(false);
    expect(isSafeRedirect(undefined)).toBe(false);
  });
});
