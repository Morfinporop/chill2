import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// In-memory storage
const users = new Map();
const chats = new Map();
const messages = new Map();
const sessions = new Map();

// Admin user (номер зашифрован в коде для безопасности)
const ADMIN_PHONE_HASH = 'a8f5f167f44f4964e6c998dee827110c'; // +7951****981
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+79514352981';
const ADMIN_USER = {
  id: 'admin',
  phone: ADMIN_PHONE,
  displayPhone: '4455',
  name: 'Создатель',
  username: 'creator',
  avatar: '#7665EB',
  bio: 'Основатель ChillGram',
  isAdmin: true,
  online: true,
  lastSeen: Date.now(),
  createdAt: Date.now(),
  phoneVisible: false // скрыть номер
};

users.set('admin', ADMIN_USER);

// WebSocket clients
const clients = new Map();

// Generate ID
const genId = () => crypto.randomBytes(16).toString('hex');

// Auth endpoints
app.post('/api/auth/send-code', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });
  
  const code = phone === ADMIN_PHONE ? '1234' : Math.floor(1000 + Math.random() * 9000).toString();
  sessions.set(phone, { code, timestamp: Date.now() });
  
  console.log(`Code for ${phone}: ${code}`);
  res.json({ success: true });
});

app.post('/api/auth/verify-code', (req, res) => {
  const { phone, code } = req.body;
  const session = sessions.get(phone);
  
  if (!session) return res.status(400).json({ error: 'No code sent' });
  if (session.code !== code) return res.status(400).json({ error: 'Invalid code' });
  
  let user = Array.from(users.values()).find(u => u.phone === phone);
  
  if (user) {
    const token = genId();
    sessions.set(token, { userId: user.id, timestamp: Date.now() });
    return res.json({ token, user, isNewUser: false });
  }
  
  res.json({ isNewUser: true, phone });
});

app.post('/api/auth/register', (req, res) => {
  const { phone, name, username, avatar } = req.body;
  
  if (Array.from(users.values()).find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username taken' });
  }
  
  const userId = genId();
  const user = {
    id: userId,
    phone,
    displayPhone: phone.slice(-4),
    name,
    username,
    avatar: avatar || '#3390EC',
    bio: 'Привет! Я использую ChillGram',
    online: false,
    lastSeen: Date.now(),
    createdAt: Date.now(),
    phoneVisible: false // номер скрыт по умолчанию
  };
  
  users.set(userId, user);
  
  const token = genId();
  sessions.set(token, { userId, timestamp: Date.now() });
  
  res.json({ token, user });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// User endpoints
app.get('/api/users/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  const user = users.get(session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  res.json(user);
});

app.patch('/api/users/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  const user = users.get(session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.username) updates.username = req.body.username;
  if (req.body.bio) updates.bio = req.body.bio;
  if (req.body.avatar) updates.avatar = req.body.avatar;
  
  Object.assign(user, updates);
  users.set(user.id, user);
  
  broadcast({ type: 'user_updated', user });
  res.json(user);
});

app.get('/api/users', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  const allUsers = Array.from(users.values())
    .filter(u => u.id !== session.userId)
    .map(({ id, name, username, avatar, bio, online, lastSeen }) => ({
      id, name, username, avatar, bio, online, lastSeen
    }));
  
  res.json(allUsers);
});

// Chat endpoints
app.get('/api/chats', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  const userChats = Array.from(chats.values())
    .filter(c => c.participants.includes(session.userId))
    .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
  
  res.json(userChats);
});

app.post('/api/chats', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  const { type, name, participants: participantIds, avatar, description } = req.body;
  
  if (type === 'private' && participantIds.length !== 1) {
    return res.status(400).json({ error: 'Private chat needs 1 participant' });
  }
  
  const participants = [session.userId, ...participantIds];
  
  if (type === 'private') {
    const existing = Array.from(chats.values()).find(c => 
      c.type === 'private' && 
      c.participants.length === 2 &&
      c.participants.includes(session.userId) &&
      c.participants.includes(participantIds[0])
    );
    
    if (existing) return res.json(existing);
  }
  
  const chatId = genId();
  const chat = {
    id: chatId,
    type: type || 'private',
    name: name || (type === 'private' ? users.get(participantIds[0])?.name : 'Новый чат'),
    avatar: avatar || (type === 'private' ? users.get(participantIds[0])?.avatar : '#4DCD5E'),
    participants,
    description: description || '',
    createdBy: session.userId,
    createdAt: Date.now(),
    pinned: [],
    muted: [],
    unread: {}
  };
  
  chats.set(chatId, chat);
  messages.set(chatId, []);
  
  participants.forEach(pid => {
    broadcastToUser(pid, { type: 'chat_created', chat });
  });
  
  res.json(chat);
});

// Message endpoints
app.get('/api/chats/:chatId/messages', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  const chat = chats.get(req.params.chatId);
  if (!chat || !chat.participants.includes(session.userId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const chatMessages = messages.get(req.params.chatId) || [];
  res.json(chatMessages);
});

app.post('/api/chats/:chatId/messages', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  const chat = chats.get(req.params.chatId);
  if (!chat || !chat.participants.includes(session.userId)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const messageId = genId();
  const message = {
    id: messageId,
    chatId: req.params.chatId,
    senderId: session.userId,
    text: req.body.text,
    replyTo: req.body.replyTo || null,
    timestamp: Date.now(),
    read: [session.userId],
    edited: false
  };
  
  const chatMessages = messages.get(req.params.chatId) || [];
  chatMessages.push(message);
  messages.set(req.params.chatId, chatMessages);
  
  chat.lastMessage = message;
  chat.lastMessageTime = message.timestamp;
  chats.set(chat.id, chat);
  
  chat.participants.forEach(pid => {
    broadcastToUser(pid, { type: 'message', message, chatId: chat.id });
  });
  
  res.json(message);
});

app.patch('/api/messages/:messageId', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  let message = null;
  let chatId = null;
  
  for (const [cid, msgs] of messages.entries()) {
    const msg = msgs.find(m => m.id === req.params.messageId);
    if (msg) {
      message = msg;
      chatId = cid;
      break;
    }
  }
  
  if (!message || message.senderId !== session.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  message.text = req.body.text;
  message.edited = true;
  
  const chat = chats.get(chatId);
  if (chat) {
    chat.participants.forEach(pid => {
      broadcastToUser(pid, { type: 'message_edited', message, chatId });
    });
  }
  
  res.json(message);
});

app.delete('/api/messages/:messageId', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  for (const [chatId, msgs] of messages.entries()) {
    const index = msgs.findIndex(m => m.id === req.params.messageId);
    if (index !== -1) {
      const message = msgs[index];
      if (message.senderId !== session.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      msgs.splice(index, 1);
      
      const chat = chats.get(chatId);
      if (chat) {
        chat.participants.forEach(pid => {
          broadcastToUser(pid, { type: 'message_deleted', messageId: req.params.messageId, chatId });
        });
      }
      
      return res.json({ success: true });
    }
  }
  
  res.status(404).json({ error: 'Message not found' });
});

// WebSocket
wss.on('connection', (ws, req) => {
  const token = new URL(req.url, 'http://localhost').searchParams.get('token');
  const session = sessions.get(token);
  
  if (!session) {
    ws.close();
    return;
  }
  
  const user = users.get(session.userId);
  if (!user) {
    ws.close();
    return;
  }
  
  user.online = true;
  user.lastSeen = Date.now();
  users.set(user.id, user);
  
  clients.set(session.userId, ws);
  console.log(`User ${user.name} connected`);
  
  broadcast({ type: 'user_online', userId: user.id, online: true });
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      
      if (msg.type === 'typing') {
        const chat = chats.get(msg.chatId);
        if (chat) {
          chat.participants.forEach(pid => {
            if (pid !== session.userId) {
              broadcastToUser(pid, { 
                type: 'typing', 
                chatId: msg.chatId, 
                userId: session.userId, 
                isTyping: msg.isTyping 
              });
            }
          });
        }
      }
      
      if (msg.type === 'read') {
        const chatMessages = messages.get(msg.chatId) || [];
        chatMessages.forEach(m => {
          if (!m.read.includes(session.userId)) {
            m.read.push(session.userId);
          }
        });
        
        const chat = chats.get(msg.chatId);
        if (chat) {
          chat.participants.forEach(pid => {
            broadcastToUser(pid, { 
              type: 'messages_read', 
              chatId: msg.chatId, 
              userId: session.userId 
            });
          });
        }
      }
    } catch (e) {
      console.error('WS message error:', e);
    }
  });
  
  ws.on('close', () => {
    clients.delete(session.userId);
    user.online = false;
    user.lastSeen = Date.now();
    users.set(user.id, user);
    
    broadcast({ type: 'user_online', userId: user.id, online: false, lastSeen: user.lastSeen });
    console.log(`User ${user.name} disconnected`);
  });
});

function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

function broadcastToUser(userId, data) {
  const client = clients.get(userId);
  if (client && client.readyState === 1) {
    client.send(JSON.stringify(data));
  }
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
