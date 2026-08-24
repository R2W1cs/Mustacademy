import { useRef } from "react";
import { io } from "socket.io-client";
import api from "../api/axios";

const isProduction =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  (isProduction ? "https://mustacademy-backend.onrender.com" : "http://localhost:5000");

// Default Socket.IO path. Cookie path is `/`, so credentials work without nesting under /api.
const SOCKET_PATH = "/socket.io";

let socketInstance = null;
let authInFlight = null;
let isSocketAuthed = false;

async function fetchWsToken() {
  try {
    const { data } = await api.get("/auth/ws-token");
    return data?.token || null;
  } catch {
    try {
      await api.post("/auth/refresh", null, { _skipRefresh: true });
      const { data } = await api.get("/auth/ws-token");
      return data?.token || null;
    } catch {
      return null;
    }
  }
}

function waitForConnect(socket, ms = 10000) {
  if (socket.connected) return Promise.resolve(true);
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onErr);
      resolve(false);
    }, ms);
    const onConnect = () => {
      clearTimeout(timer);
      socket.off("connect_error", onErr);
      resolve(true);
    };
    const onErr = () => {
      clearTimeout(timer);
      socket.off("connect", onConnect);
      resolve(false);
    };
    socket.once("connect", onConnect);
    socket.once("connect_error", onErr);
    try {
      socket.connect();
    } catch {
      /* already connecting */
    }
  });
}

/**
 * Authenticate the shared socket. Pass { force: true } on Retry so we don't
 * reuse a stuck/failed in-flight auth from the initial connect handler.
 */
export async function authenticateSocket(socket = socketInstance, { force = false } = {}) {
  if (!socket) return false;

  if (!force && isSocketAuthed && socket.connected) return true;

  if (authInFlight && !force) return authInFlight;

  if (force && authInFlight) {
    try {
      await authInFlight;
    } catch {
      /* ignore */
    }
  }

  authInFlight = (async () => {
    const connected = await waitForConnect(socket);
    if (!connected) {
      isSocketAuthed = false;
      return false;
    }

    if (!force && isSocketAuthed) return true;

    const userName = localStorage.getItem("userName") || "Scholar";
    const token = await fetchWsToken();

    return new Promise((resolve) => {
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.off("authenticated", onOk);
        socket.off("auth_error", onErr);
        isSocketAuthed = ok;
        resolve(ok);
      };

      const timer = setTimeout(() => finish(false), 10000);
      const onOk = () => finish(true);
      const onErr = () => finish(false);

      socket.once("authenticated", onOk);
      socket.once("auth_error", onErr);
      socket.emit("authenticate", token ? { userName, token } : { userName });
    });
  })().finally(() => {
    authInFlight = null;
  });

  return authInFlight;
}

export function getSocketStatus() {
  return {
    connected: Boolean(socketInstance?.connected),
    authed: isSocketAuthed,
    url: SOCKET_URL,
    path: SOCKET_PATH,
  };
}

export const useSocket = () => {
  const socketRef = useRef(null);

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      path: SOCKET_PATH,
      autoConnect: true,
      reconnection: true,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("disconnect", () => {
      isSocketAuthed = false;
    });

    socketInstance.on("authenticated", () => {
      isSocketAuthed = true;
    });

    socketInstance.on("connect", () => {
      // Warm auth in the background; arena will force-auth if needed.
      authenticateSocket(socketInstance).catch(() => {});
    });
  }

  socketRef.current = socketInstance;
  return socketRef.current;
};
