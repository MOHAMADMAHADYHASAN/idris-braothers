'use client';

import React from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Intelligent in-app back navigation handler.
 * - If the user navigated from another page within this application session
 *   (i.e. window.history.state.idx > 0 or internal document.referrer),
 *   it triggers `router.back()` to preserve prior state, active filters, search queries, and scroll position.
 * - If the page was opened directly (new tab, bookmark, or direct URL entry),
 *   it lets the browser navigate cleanly to `fallbackHref`.
 */
export function handleSmartBack(
  e: React.MouseEvent,
  router: AppRouterInstance,
  fallbackHref: string = '/'
) {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    const state = window.history.state;
    const hasHistoryIdx = state && typeof state.idx === 'number' && state.idx > 0;
    const isSameOriginReferrer =
      typeof document !== 'undefined' &&
      Boolean(document.referrer) &&
      document.referrer.startsWith(window.location.origin);

    if (hasHistoryIdx || isSameOriginReferrer) {
      e.preventDefault();
      router.back();
      return;
    }
  }
  // Let default Link navigation proceed to fallbackHref
}
