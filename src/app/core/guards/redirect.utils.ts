import { Router, UrlTree } from '@angular/router';

export const REDIRECT_QUERY_PARAM = 'redirectTo';

/** Builds the login URL preserving the originally requested path. */
export function loginRedirect(router: Router, attemptedUrl: string): UrlTree {
  const queryParams =
    attemptedUrl && attemptedUrl !== '/' ? { [REDIRECT_QUERY_PARAM]: attemptedUrl } : {};
  return router.createUrlTree(['/login'], { queryParams });
}

/** Only allows in-app absolute paths, never protocol-relative or external URLs. */
export function isSafeRedirect(url: string | null | undefined): url is string {
  return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');
}
