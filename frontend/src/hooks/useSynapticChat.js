import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export const useSynapticChat = (roomId) => {
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    // Initial load
    useEffect(() => {
        if (!roomId) return;

        const loadContent = async () => {
            setLoading(true);
            try {
                const [msgRes, memberRes] = await Promise.all([
                    api.get(`/chat/rooms/${roomId}/messages`),
                    api.get(`/chat/rooms/${roomId}/members`)
                ]);
                setMessages(msgRes.data);
                setMembers(memberRes.data);
                setError(null);
            } catch (err) {
                console.error("Failed to load synaptic data:", err);
                setError("Disconnected from Synaptic Grid.");
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [roomId]);

    // Socket Connection
    useEffect(() => {
        if (!roomId) return;

        socketRef.current = io(SOCKET_URL);
        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log(`[SYNAPTIC_SYNC] Connected to room_${roomId}`);
            socket.emit('authenticate', localStorage.getItem('userId'));
            socket.emit('join_room', roomId);
        });

        socket.on('new_message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        socket.on('voice_update', ({ userId, isVoiceActive }) => {
            setMembers(prev => prev.map(m =>
                m.id === userId ? { ...m, is_voice_active: isVoiceActive } : m
            ));
        });

        return () => {
            if (socket) {
                socket.emit('leave_room', roomId);
                socket.disconnect();
            }
        };
    }, [roomId]);

    const sendMessage = useCallback(async (text, attachment = null) => {
        if (!roomId) return;
        try {
            const res = await api.post(`/chat/rooms/${roomId}/messages`, {
                text,
                attachmentUrl: attachment?.url,
                attachmentType: attachment?.type
            });
            // We don't manually update state because the socket listener handles it
            return res.data;
        } catch (err) {
            console.error("Message transmission failed:", err);
            throw err;
        }
    }, [roomId]);

    const toggleVoice = useCallback(async (isActive) => {
        if (!roomId) return;
        try {
            await api.put(`/chat/rooms/${roomId}/voice`, { isVoiceActive: isActive });
        } catch (err) {
            console.error("Voice sync failed:", err);
        }
    }, [roomId]);

    return {
        messages,
        members,
        loading,
        error,
        sendMessage,
        toggleVoice
    };
};
