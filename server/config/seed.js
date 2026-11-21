const bcrypt = require('bcryptjs');
const Store = require('../models/store');

const seedDemoData = async () => {
  try {
    const existingAdmin = await Store.findUserByEmail('admin@chatbot.com');
    if (existingAdmin) {
      console.log('🌱 Demo data already present, skipping seed.');
      return;
    }

    console.log('🌱 Seeding demo accounts and conversation history...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Create Admin
    const adminUser = await Store.createUser({
      name: 'Asif Ali (Admin)',
      email: 'admin@chatbot.com',
      password: passwordHash,
      role: 'admin',
      preferences: {
        theme: 'dark',
        botName: 'NovaAI Enterprise',
        category: 'professional'
      }
    });

    // 2. Create Regular User
    const standardUser = await Store.createUser({
      name: 'Sarah Connor',
      email: 'user@chatbot.com',
      password: passwordHash,
      role: 'user',
      preferences: {
        theme: 'dark',
        botName: 'NovaAI',
        category: 'general'
      }
    });

    // 3. Create Sample Sessions for Admin
    const session1 = await Store.createSession(
      adminUser._id,
      'Full-Stack Architecture & WebSockets',
      'professional'
    );

    await Store.createMessage({
      sessionId: session1._id,
      userId: adminUser._id,
      sender: 'user',
      content: 'How should we architect bidirectional WebSocket communication with Express and Socket.io for low latency?',
      category: 'professional'
    });

    await Store.createMessage({
      sessionId: session1._id,
      userId: adminUser._id,
      sender: 'ai',
      content: `### 🚀 Production WebSocket Architecture Pattern

For high-throughput, low-latency streaming:

\`\`\`javascript
const { Server } = require('socket.io');
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  socket.on('join_session', ({ sessionId }) => socket.join(sessionId));
  socket.on('send_message', async (data) => {
    // Process async AI pipeline
  });
});
\`\`\`

1. **Connection Pooling:** Use WebSocket transports first to bypass HTTP handshake overhead.
2. **Room Partitioning:** Partition client subscriptions per \`sessionId\` to avoid unnecessary broadcasts.
3. **Graceful Fallbacks:** Keep HTTP REST endpoints active for non-streaming clients.`,
      category: 'professional',
      tokens: 185,
      responseTimeMs: 310,
      rating: { score: 1, feedback: 'Accurate architectural breakdown' }
    });

    const session2 = await Store.createSession(
      adminUser._id,
      'Weekend Creative Story Prompt',
      'creative'
    );

    await Store.createMessage({
      sessionId: session2._id,
      userId: adminUser._id,
      sender: 'user',
      content: 'Write a gripping cyber-noir opening set in Neo-Kyoto 2099.',
      category: 'creative'
    });

    await Store.createMessage({
      sessionId: session2._id,
      userId: adminUser._id,
      sender: 'ai',
      content: `The neon rain in Neo-Kyoto never washed anything clean—it only made the chrome pavements mirror the synthetic pinks and cold cyans of corporate holograms. 

Detective Vance pulled up the synthetic collar of his trench coat as a hover-cab skimmed three inches above the mist. His neural port hummed with an encrypted beacon from a sender that officially ceased existing four years ago.

> *"If you can read this, Vance, they've already compromised Sector 7."*`,
      category: 'creative',
      tokens: 110,
      responseTimeMs: 275,
      rating: { score: 1, feedback: 'Great imagery!' }
    });

    console.log('✅ Demo seed data initialized successfully!');
  } catch (err) {
    console.error('Seed data error:', err.message);
  }
};

module.exports = { seedDemoData };
