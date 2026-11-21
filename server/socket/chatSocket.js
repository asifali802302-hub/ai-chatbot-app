const Store = require('../models/store');
const { generateAIResponse } = require('../services/aiService');
const { verifySocketToken } = require('../middleware/auth');

const setupChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifySocketToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      const user = await Store.findUserById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ WebSocket client connected: ${socket.user.name} (${socket.id})`);

    // 1. Join a specific session room
    socket.on('join_session', ({ sessionId }) => {
      socket.join(sessionId);
      console.log(`User ${socket.user.name} joined session room: ${sessionId}`);
    });

    // 2. Leave session room
    socket.on('leave_session', ({ sessionId }) => {
      socket.leave(sessionId);
    });

    // 3. Real-time message transmission
    socket.on('send_message', async ({ sessionId, prompt, category }) => {
      try {
        if (!prompt) return;

        let activeCategory = category || socket.user.preferences?.category || 'general';
        const botName = socket.user.preferences?.botName || 'NovaAI';

        let session = sessionId ? await Store.getSessionById(sessionId, socket.user._id) : null;
        let targetSessionId = sessionId;

        if (!session) {
          const generatedTitle = prompt.length > 35 ? prompt.substring(0, 32) + '...' : prompt;
          session = await Store.createSession(socket.user._id, generatedTitle, activeCategory);
          targetSessionId = session._id.toString();
        } else {
          activeCategory = category || session.category || activeCategory;
        }

        socket.join(targetSessionId);

        // 1. Save and broadcast user message
        const userMessage = await Store.createMessage({
          sessionId: targetSessionId,
          userId: socket.user._id,
          sender: 'user',
          content: prompt,
          category: activeCategory
        });

        // Broadcast to sender directly and other room members
        socket.emit('receive_message', userMessage);
        socket.to(targetSessionId).emit('receive_message', userMessage);

        // Update session title if first message
        if (session.title === 'New Conversation') {
          const generatedTitle = prompt.length > 35 ? prompt.substring(0, 32) + '...' : prompt;
          await Store.updateSessionTitle(targetSessionId, socket.user._id, generatedTitle);
          socket.emit('session_updated', { sessionId: targetSessionId, title: generatedTitle });
          socket.to(targetSessionId).emit('session_updated', { sessionId: targetSessionId, title: generatedTitle });
        }

        // 2. Send AI Typing indicator
        socket.emit('ai_typing', { sessionId: targetSessionId, isTyping: true });
        socket.to(targetSessionId).emit('ai_typing', { sessionId: targetSessionId, isTyping: true });

        // 3. Generate AI response
        const aiResult = await generateAIResponse(prompt, activeCategory, botName);

        // Turn off typing indicator
        socket.emit('ai_typing', { sessionId: targetSessionId, isTyping: false });
        socket.to(targetSessionId).emit('ai_typing', { sessionId: targetSessionId, isTyping: false });

        // 4. Save and broadcast AI message
        const aiMessage = await Store.createMessage({
          sessionId: targetSessionId,
          userId: socket.user._id,
          sender: 'ai',
          content: aiResult.content,
          category: activeCategory,
          tokens: aiResult.tokens,
          responseTimeMs: aiResult.responseTimeMs
        });

        socket.emit('receive_message', aiMessage);
        socket.to(targetSessionId).emit('receive_message', aiMessage);

      } catch (err) {
        console.error('Socket send_message error:', err);
        socket.emit('ai_typing', { sessionId, isTyping: false });
        socket.emit('error', { message: 'Failed to process AI message' });
      }
    });

    // 4. Rate message in real-time
    socket.on('rate_message', async ({ messageId, score, feedback }) => {
      try {
        const updated = await Store.rateMessage(messageId, score, feedback);
        if (updated) {
          socket.emit('message_rated', { messageId, rating: updated.rating });
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to rate message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = { setupChatSocket };
