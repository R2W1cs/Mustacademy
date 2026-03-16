import { useRef } from "react";
import { io } from "socket.io-client";
import { getSocketUrl } from "../api/axios";

const SOCKET_URL = getSocketUrl();

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
