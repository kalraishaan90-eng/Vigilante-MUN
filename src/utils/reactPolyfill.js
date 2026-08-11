import React from 'react';

if (typeof window !== 'undefined') {
  const actualInternals =
    React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
    {};

  if (!actualInternals.ReactCurrentOwner) {
    actualInternals.ReactCurrentOwner = { current: null };
  }

  if (!actualInternals.ReactCurrentBatchConfig) {
    actualInternals.ReactCurrentBatchConfig = { transition: null };
  }

  if (!actualInternals.ReactCurrentDispatcher) {
    actualInternals.ReactCurrentDispatcher = { current: null };
  }

  if (!actualInternals.ReactDebugCurrentFrame) {
    actualInternals.ReactDebugCurrentFrame = { getStackAddendum: () => '' };
  } else if (typeof actualInternals.ReactDebugCurrentFrame.getStackAddendum !== 'function') {
    actualInternals.ReactDebugCurrentFrame.getStackAddendum = () => '';
  }

  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = actualInternals;
}
