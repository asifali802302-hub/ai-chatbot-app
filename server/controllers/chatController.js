const Store = require('../models/store');
const { generateAIResponse } = require('../services/aiService');

const sendMessage = async (req, res) => {
  try {
    const { sessionId, prompt, category } = req.body;

    if (!sessionId || !prompt) {
      return res.status(400).json({ message: 'sessionId and prompt are required' });
    }

    let activeCategory = category || req.user.preferences?.category || 'general';
    const botName = req.user.preferences?.botName || 'NovaAI';

    let session = await Store.getSessionById(sessionId, req.user._id);
    let targetSessionId = sessionId;

    // Self-healing: if session expired or not found, automatically create a new session
    if (!session) {
      const generatedTitle = prompt.length > 35 ? prompt.substring(0, 32) + '...' : prompt;
      session = await Store.createSession(req.user._id, generatedTitle, activeCategory);
      targetSessionId = session._id.toString();
    } else {
      activeCategory = category || session.category || activeCategory;
    }

    // 1. Save user message to database
    const userMessage = await Store.createMessage({
      sessionId: targetSessionId,
      userId: req.user._id,
      sender: 'user',
      content: prompt,
      category: activeCategory
    });

    // Automatically update session title if it's the first message
    if (session.title === 'New Conversation') {
      const generatedTitle = prompt.length > 35 ? prompt.substring(0, 32) + '...' : prompt;
      await Store.updateSessionTitle(targetSessionId, req.user._id, generatedTitle);
    }

    // 2. Generate AI response
    const aiResult = await generateAIResponse(prompt, activeCategory, botName);

    // 3. Save AI message to database
    const aiMessage = await Store.createMessage({
      sessionId: targetSessionId,
      userId: req.user._id,
      sender: 'ai',
      content: aiResult.content,
      category: activeCategory,
      tokens: aiResult.tokens,
      responseTimeMs: aiResult.responseTimeMs
    });

    res.json({
      userMessage,
      aiMessage,
      model: aiResult.model
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process message', error: error.message });
  }
};

const rateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { score, feedback = '' } = req.body; // score: 1 for thumbs up, -1 for thumbs down

    if (score !== 1 && score !== -1 && score !== 0) {
      return res.status(400).json({ message: 'Score must be 1, -1, or 0' });
    }

    const updated = await Store.rateMessage(messageId, score, feedback);
    if (!updated) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Feedback recorded', rating: updated.rating });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record feedback', error: error.message });
  }
};

module.exports = {
  sendMessage,
  rateMessage
};
