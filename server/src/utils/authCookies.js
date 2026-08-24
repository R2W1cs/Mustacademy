const ACCESS_MS = 15 * 60 * 1000;
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

const isProd = () => process.env.NODE_ENV === 'production';

export const ACCESS_COOKIE = 'ma_access';
export const REFRESH_COOKIE = 'ma_refresh';

export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'lax',
    maxAge: ACCESS_MS,
    // Must be `/` so Socket.IO (path `/socket.io`) receives the cookie.
    // Path `/api` only covers REST and caused "No token provided" on arena sockets.
    path: '/',
  };
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'lax',
    maxAge: REFRESH_MS,
    path: '/api/auth',
  };
}

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions());
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
}

export function clearAuthCookies(res) {
  // Clear both current and legacy paths so old `/api` cookies do not linger.
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(ACCESS_COOKIE, { path: '/api' });
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
}