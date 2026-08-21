import { renewSession } from './authApi.js';
import { createAuthSession } from './authSession.js';

let activeRenewal = null;

export function renewAuthSession() {
  activeRenewal ??= renewSession()
    .then((accessToken) => createAuthSession(accessToken))
    .finally(() => {
      activeRenewal = null;
    });

  return activeRenewal;
}
