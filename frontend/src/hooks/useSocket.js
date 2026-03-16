import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || (isProduction ? "https://mustacademy-backend.onrender.com" : "http://localhost:3001");

let socketInstance = null;

export const useSocket = () => {
    const socketRef = useRef(null);

    if (!socketInstance) {
        socketInstance = io(SOCKET_URL, {
            autoConnect: true,
            reconnection: true
        });

        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName") || "Scholar";
        if (userId) {
            socketInstance.emit("authenticate", { userId, userName });
        }
    }

    socketRef.current = socketInstance;

    return socketRef.current;
};
