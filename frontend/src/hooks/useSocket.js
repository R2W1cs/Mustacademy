import { useRef } from "react";
import { io } from "socket.io-client";
import api from "../api/axios";

const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  (isProduction ? "https://mustacademy-backend.onrender.com" : "http://localhost:5000");

let socketInstance = null;
let authInFlight = null;

async function fetchWsToken() {
  try {
    // Refresh access cookie first if needed, then mint a WS token from it.
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

export async function authenticateSocket(socket = socketInstance) {
  if (!socket) return false;
  if (authInFlight) return authInFlight;

  authInFlight = (async () => {
    const userName = localStorage.getItem("userName") || "Scholar";
    const token = await fetchWsToken();

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        socket.off("authenticated", onOk);
        socket.off("auth_error", onErr);
        resolve(false);
      }, 8000);

      const onOk = () => {
        clearTimeout(timer);
        socket.off("auth_error", onErr);
        resolve(true);
      };
      const onErr = () => {
        clearTimeout(timer);
        socket.off("authenticated", onOk);
        resolve(false);
      };

      socket.once("authenticated", onOk);
      socket.once("auth_error", onErr);
      socket.emit("authenticate", token ? { userName, token } : { userName });
    });
  })().finally(() => {
    authInFlight = null;
  });

  return authInFlight;
}

export const useSocket = () => {
  const socketRef = useRef(null);

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      path: "/api/socket.io",
      autoConnect: true,
      reconnection: true,
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      authenticateSocket(socketInstance);
    });
  }

  socketRef.current = socketInstance;
  return socketRef.current;
};
