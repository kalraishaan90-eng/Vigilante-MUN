import React from 'react';

if (typeof window !== 'undefined' || true) {
  const reactObj = React;
  
  if (reactObj) {
    const internals =
      reactObj.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
      reactObj.__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
      reactObj.__SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
      {};

    if (!internals.ReactCurrentOwner) {
      internals.ReactCurrentOwner = { current: null };
    }
    if (!internals.ReactCurrentDispatcher) {
      internals.ReactCurrentDispatcher = { current: null };
    }
    if (!internals.ReactCurrentBatchConfig) {
      internals.ReactCurrentBatchConfig = { transition: null };
    }

    try {
      reactObj.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = internals;
    } catch {
      try {
        Object.defineProperty(reactObj, '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED', {
          value: internals,
          configurable: true,
          writable: true,
          enumerable: true,
        });
      } catch {
        // ignore fallback errors
      }
    }
  }
}
