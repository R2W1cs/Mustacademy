import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || (isProduction ? "https://mustacademy-backend.onrender.com" : "http://localhost:5000");

let socketInstance = null;

export const useSocket = () => {
    const socketRef = useRef(null);

    if (!socketInstance) {
        socketInstance = io(SOCKET_URL, {
            path: '/api/socket.io',
            autoConnect: true,
            reconnection: true,
            withCredentials: true,
        });

        const userName = localStorage.getItem("userName") || "Scholar";
        socketInstance.on("connect", () => {
            socketInstance.emit("authenticate", { userName });
        });
    }

    socketRef.current = socketInstance;

    return socketRef.current;
};
