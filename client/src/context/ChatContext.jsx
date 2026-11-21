import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sessionAPI, chatAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [category, setCategory] = useState('general');

  // Load sessions when authenticated
  const loadSessions = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingSessions(true);
      const res = await sessionAPI.getSessions();
      const loadedSessions = res.data.sessions || [];
      setSessions(loadedSessions);

      // Auto-select latest session or prompt to create new
      if (loadedSessions.length > 0 && !activeSessionId) {
        selectSession(loadedSessions[0]._id);
      }
    } catch (err) {
      console.warn('Failed to load chat sessions:', err.message);
    } finally {
      setLoadingSessions(false);
    }
  }, [isAuthenticated, activeSessionId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Sync category with user preferences when user logs in
  useEffect(() => {
    if (user?.preferences?.category) {
      setCategory(user.preferences.category);
    }
  }, [user]);

  // Fetch messages when activeSessionId changes
  const selectSession = async (sessionId) => {
    setActiveSessionId(sessionId);
    try {
      setLoadingMessages(true);
      const res = await sessionAPI.getSessionMessages(sessionId);
      setMessages(res.data.messages || []);
      if (res.data.session?.category) {
        setCategory(res.data.session.category);
      }

      // Join socket room
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('join_session', { sessionId });
      }
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Setup Socket listeners for real-time messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (msg.sessionId === activeSessionId) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }

      // Update session timestamp & title in sidebar
      setSessions((prev) =>
        prev.map((s) => (s._id === msg.sessionId ? { ...s, updatedAt: new Date() } : s))
      );
    };

    const handleAiTyping = ({ sessionId, isTyping }) => {
      if (sessionId === activeSessionId) {
        setIsAiTyping(isTyping);
      }
    };

    const handleSessionUpdated = ({ sessionId, title }) => {
      setSessions((prev) =>
        prev.map((s) => (s._id === sessionId ? { ...s, title } : s))
      );
    };

    const handleMessageRated = ({ messageId, rating }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, rating } : m))
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('ai_typing', handleAiTyping);
    socket.on('session_updated', handleSessionUpdated);
    socket.on('message_rated', handleMessageRated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('ai_typing', handleAiTyping);
      socket.off('session_updated', handleSessionUpdated);
      socket.off('message_rated', handleMessageRated);
    };
  }, [activeSessionId]);

  // Create a brand new session
  const createNewSession = async (customCategory) => {
    try {
      const cat = customCategory || category || 'general';
      const res = await sessionAPI.createSession('New Conversation', cat);
      const newSession = res.data.session;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession._id);
      setMessages([]);
      setCategory(cat);

      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('join_session', { sessionId: newSession._id });
      }

      return newSession;
    } catch (err) {
      toast.error('Failed to start new conversation');
      return null;
    }
  };

  // Send message
  const sendMessage = async (prompt) => {
    if (!prompt.trim()) return;

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      const created = await createNewSession();
      if (!created) return;
      targetSessionId = created._id;
    }

    const socket = getSocket();
    if (socket && socket.connected) {
      // Send via real-time WebSocket
      socket.emit('send_message', {
        sessionId: targetSessionId,
        prompt: prompt.trim(),
        category
      });
    } else {
      // Fallback via HTTP REST
      try {
        setIsAiTyping(true);
        const res = await chatAPI.sendMessage(targetSessionId, prompt.trim(), category);
        setMessages((prev) => [...prev, res.data.userMessage, res.data.aiMessage]);
        loadSessions(); // refresh title if updated
      } catch (err) {
        toast.error('Failed to send message');
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  // Delete session
  const deleteSession = async (sessionId, e) => {
    if (e) e.stopPropagation();
    try {
      await sessionAPI.deleteSession(sessionId);
      const remaining = sessions.filter((s) => s._id !== sessionId);
      setSessions(remaining);
      toast.success('Conversation deleted');

      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          selectSession(remaining[0]._id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      toast.error('Failed to delete conversation');
    }
  };

  // Rate message (thumbs up / thumbs down)
  const rateMessage = async (messageId, score, feedback = '') => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('rate_message', { messageId, score, feedback });
    }

    try {
      const res = await chatAPI.rateMessage(messageId, score, feedback);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, rating: res.data.rating } : m))
      );
      toast.success(score === 1 ? 'Glad you liked it! 👍' : 'Feedback recorded 👎');
    } catch (err) {
      toast.error('Failed to save rating');
    }
  };

  const activeSession = sessions.find((s) => s._id === activeSessionId) || null;

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSessionId,
        activeSession,
        messages,
        loadingSessions,
        loadingMessages,
        isAiTyping,
        category,
        setCategory,
        selectSession,
        createNewSession,
        sendMessage,
        deleteSession,
        rateMessage,
        loadSessions
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
