import { homeRouteForRole, parseUserRole } from './auth.models';

describe('parseUserRole', () => {
  it('accepts only the known role claims', () => {
    expect(parseUserRole('ADMIN')).toBe('ADMIN');
    expect(parseUserRole('STUDENT')).toBe('STUDENT');
  });

  it('rejects unknown, lowercase or non-string claims', () => {
    expect(parseUserRole('admin')).toBeNull();
    expect(parseUserRole('SUPERUSER')).toBeNull();
    expect(parseUserRole(undefined)).toBeNull();
    expect(parseUserRole(1)).toBeNull();
  });
});

describe('homeRouteForRole', () => {
  it('routes each role to its portal', () => {
    expect(homeRouteForRole('ADMIN')).toBe('/admin');
    expect(homeRouteForRole('STUDENT')).toBe('/app');
  });

  it('sends users without a role to the unauthorized page', () => {
    expect(homeRouteForRole(null)).toBe('/unauthorized');
  });
});
