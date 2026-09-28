/**
 * authService — Temporary localStorage-based admin auth
 * Replace the body of these functions with Supabase auth SDK calls
 * when ready to move to production.
 */
import { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_KEY } from '../config/admin';

export const authService = {
  login(username: string, password: string): boolean {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    }
    return false;
  },

  logout(): void {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  },

  isLoggedIn(): boolean {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  },
};
