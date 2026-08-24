const SOCKET_TOKEN_KEY = "ma_socket_token";

export function getSocketToken() {
  try {
    return sessionStorage.getItem(SOCKET_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setSocketToken(token) {
  try {
    if (token) sessionStorage.setItem(SOCKET_TOKEN_KEY, token);
    else sessionStorage.removeItem(SOCKET_TOKEN_KEY);
  } catch {
    /* private mode / blocked storage */
  }
}

export function clearSocketToken() {
  setSocketToken(null);
}
