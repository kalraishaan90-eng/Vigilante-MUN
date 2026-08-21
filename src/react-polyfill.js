import React from 'react';

// Polyfill secret internals safely without corrupting ReactCurrentDispatcher
if (React && !React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  const existingInternals =
    React.__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
    React.__SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

  if (existingInternals) {
    try {
      Object.defineProperty(React, '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED', {
        get() {
          return (
            React.__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
            React.__SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
            existingInternals
          );
        },
        configurable: true,
        enumerable: true,
      });
    } catch {
      // ignore
    }
  }
}
