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
          if (prev.some((m) => m._id === msg._id || (m.sender === msg.sender && m.content === msg.content))) {
            return prev;
          }
          return [...prev, msg];
        });
      }

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

  // Send message with instant optimistic UI and guaranteed dual-channel delivery
  const sendMessage = async (prompt) => {
    if (!prompt.trim()) return;

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      const created = await createNewSession();
      if (!created) return;
      targetSessionId = created._id;
    }

    const trimmedPrompt = prompt.trim();

    // 1. Instantly display user bubble optimistically
    const tempUserMsg = {
      _id: 'temp-' + Date.now(),
      sessionId: targetSessionId,
      sender: 'user',
      content: trimmedPrompt,
      category,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsAiTyping(true);

    // 2. Also emit to socket for room synchronization
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('join_session', { sessionId: targetSessionId });
      socket.emit('ai_typing', { sessionId: targetSessionId, isTyping: true });
    }

    // 3. Guaranteed HTTP REST dispatch
    try {
      const res = await chatAPI.sendMessage(targetSessionId, trimmedPrompt, category);
      const { userMessage, aiMessage } = res.data;

      // Replace optimistic message and append AI response
      setMessages((prev) => {
        const withoutTemp = prev.filter(
          (m) => m._id !== tempUserMsg._id && m._id !== userMessage._id
        );
        const withoutDupAi = withoutTemp.filter((m) => m._id !== aiMessage._id);
        return [...withoutDupAi, userMessage, aiMessage];
      });

      // Update session title in sidebar
      loadSessions();
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error(err.response?.data?.message || 'Failed to get AI response. Please try again.');
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
    } finally {
      setIsAiTyping(false);
      if (socket && socket.connected) {
        socket.emit('ai_typing', { sessionId: targetSessionId, isTyping: false });
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
