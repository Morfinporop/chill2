import { create } from 'zustand';
import { api, type User, type Chat, type Message } from '../lib/api';

interface AppState {
  // Auth
  isLoggedIn: boolean;
  currentUser: User | null;
  login: (phone: string, code: string) => Promise<{ isNewUser: boolean; phone?: string }>;
  register: (phone: string, name: string, username: string, avatar: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loadMe: () => Promise<void>;

  // Users
  users: Map<string, User>;
  loadUsers: () => Promise<void>;

  // Chats
  chats: Chat[];
  activeChatId: string | null;
  setActiveChat: (chatId: string | null) => void;
  loadChats: () => Promise<void>;
  createChat: (userId: string) => Promise<void>;
  createGroup: (name: string, participants: string[], avatar: string) => Promise<void>;
  createChannel: (name: string, description: string, avatar: string) => Promise<void>;

  // Messages
  messages: Map<string, Message[]>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, text: string, replyTo?: string) => Promise<void>;
  editMessage: (messageId: string, text: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  // UI
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  chatBgStyle: string;
  setChatBgStyle: (style: string) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  showNewChat: boolean;
  setShowNewChat: (show: boolean) => void;
  showChatInfo: boolean;
  setShowChatInfo: (show: boolean) => void;
  showCreateGroup: boolean;
  setShowCreateGroup: (show: boolean) => void;
  showCreateChannel: boolean;
  setShowCreateChannel: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Typing indicators
  typing: Map<string, Set<string>>;

  // Initialize
  init: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  isLoggedIn: false,
  currentUser: null,

  login: async (phone, code) => {
    const result = await api.verifyCode(phone, code);
    if (result.isNewUser) {
      return { isNewUser: true, phone: result.phone };
    }
    set({ isLoggedIn: true, currentUser: result.user });
    api.connectWS();
    await get().init();
    return { isNewUser: false };
  },

  register: async (phone, name, username, avatar) => {
    const result = await api.register(phone, name, username, avatar);
    set({ isLoggedIn: true, currentUser: result.user });
    api.connectWS();
    await get().init();
  },

  logout: async () => {
    await api.logout();
    set({
      isLoggedIn: false,
      currentUser: null,
      chats: [],
      messages: new Map(),
      users: new Map(),
      activeChatId: null,
    });
  },

  updateProfile: async (updates) => {
    const user = await api.updateMe(updates);
    set({ currentUser: user });
  },

  loadMe: async () => {
    try {
      const user = await api.getMe();
      set({ isLoggedIn: true, currentUser: user });
      api.connectWS();
      await get().init();
    } catch (e) {
      set({ isLoggedIn: false, currentUser: null });
    }
  },

  users: new Map(),
  loadUsers: async () => {
    const usersList = await api.getUsers();
    const usersMap = new Map(usersList.map(u => [u.id, u]));
    set({ users: usersMap });
  },

  chats: [],
  activeChatId: null,
  setActiveChat: (chatId) => {
    set({ activeChatId: chatId });
    if (chatId) {
      get().loadMessages(chatId);
      api.sendWS({ type: 'read', chatId });
    }
  },

  loadChats: async () => {
    const chats = await api.getChats();
    set({ chats });
  },

  createChat: async (userId) => {
    const existing = get().chats.find(
      c => c.type === 'private' && c.participants.includes(userId)
    );
    if (existing) {
      set({ activeChatId: existing.id, showNewChat: false });
      return;
    }
    const chat = await api.createChat('private', [userId]);
    set(s => ({ chats: [chat, ...s.chats], activeChatId: chat.id, showNewChat: false }));
  },

  createGroup: async (name, participants, avatar) => {
    const chat = await api.createChat('group', participants, name, avatar);
    set(s => ({ chats: [chat, ...s.chats], activeChatId: chat.id, showCreateGroup: false }));
  },

  createChannel: async (name, description, avatar) => {
    const chat = await api.createChat('channel', [], name, avatar, description);
    set(s => ({ chats: [chat, ...s.chats], activeChatId: chat.id, showCreateChannel: false }));
  },

  messages: new Map(),
  loadMessages: async (chatId) => {
    const msgs = await api.getMessages(chatId);
    set(s => {
      const newMessages = new Map(s.messages);
      newMessages.set(chatId, msgs);
      return { messages: newMessages };
    });
  },

  sendMessage: async (chatId, text, replyTo) => {
    await api.sendMessage(chatId, text, replyTo);
    // Message will come through WebSocket
  },

  editMessage: async (messageId, text) => {
    await api.editMessage(messageId, text);
    // Update will come through WebSocket
  },

  deleteMessage: async (messageId) => {
    await api.deleteMessage(messageId);
    // Update will come through WebSocket
  },

  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
    set({ theme: newTheme });
  },

  chatBgStyle: localStorage.getItem('chatBgStyle') || 'default',
  setChatBgStyle: (style) => {
    localStorage.setItem('chatBgStyle', style);
    set({ chatBgStyle: style });
  },

  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),
  showProfile: false,
  setShowProfile: (show) => set({ showProfile: show }),
  showNewChat: false,
  setShowNewChat: (show) => set({ showNewChat: show }),
  showChatInfo: false,
  setShowChatInfo: (show) => set({ showChatInfo: show }),
  showCreateGroup: false,
  setShowCreateGroup: (show) => set({ showCreateGroup: show }),
  showCreateChannel: false,
  setShowCreateChannel: (show) => set({ showCreateChannel: show }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  typing: new Map(),

  init: async () => {
    await Promise.all([
      get().loadChats(),
      get().loadUsers(),
    ]);

    // Setup WebSocket listeners
    api.on('message', (data) => {
      const msg = data.message as Message;
      set(s => {
        const newMessages = new Map(s.messages);
        const chatMsgs = newMessages.get(msg.chatId) || [];
        newMessages.set(msg.chatId, [...chatMsgs, msg]);
        
        // Update chat last message
        const newChats = s.chats.map(c =>
          c.id === msg.chatId
            ? { ...c, lastMessage: msg, lastMessageTime: msg.timestamp }
            : c
        ).sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
        
        return { messages: newMessages, chats: newChats };
      });
    });

    api.on('message_edited', (data) => {
      const msg = data.message as Message;
      set(s => {
        const newMessages = new Map(s.messages);
        const chatMsgs = newMessages.get(data.chatId) || [];
        const index = chatMsgs.findIndex(m => m.id === msg.id);
        if (index !== -1) {
          chatMsgs[index] = msg;
          newMessages.set(data.chatId, [...chatMsgs]);
        }
        return { messages: newMessages };
      });
    });

    api.on('message_deleted', (data) => {
      set(s => {
        const newMessages = new Map(s.messages);
        const chatMsgs = newMessages.get(data.chatId) || [];
        newMessages.set(data.chatId, chatMsgs.filter(m => m.id !== data.messageId));
        return { messages: newMessages };
      });
    });

    api.on('user_online', (data) => {
      set(s => {
        const newUsers = new Map(s.users);
        const user = newUsers.get(data.userId);
        if (user) {
          user.online = data.online;
          user.lastSeen = data.lastSeen || Date.now();
          newUsers.set(user.id, user);
        }
        return { users: newUsers };
      });
    });

    api.on('typing', (data) => {
      set(s => {
        const newTyping = new Map(s.typing);
        if (data.isTyping) {
          if (!newTyping.has(data.chatId)) {
            newTyping.set(data.chatId, new Set());
          }
          newTyping.get(data.chatId)!.add(data.userId);
        } else {
          newTyping.get(data.chatId)?.delete(data.userId);
        }
        return { typing: newTyping };
      });

      setTimeout(() => {
        set(s => {
          const newTyping = new Map(s.typing);
          newTyping.get(data.chatId)?.delete(data.userId);
          return { typing: newTyping };
        });
      }, 3000);
    });

    api.on('chat_created', async (data) => {
      set(s => ({ chats: [data.chat, ...s.chats] }));
    });

    api.on('user_updated', (data) => {
      set(s => {
        const newUsers = new Map(s.users);
        newUsers.set(data.user.id, data.user);
        return { users: newUsers };
      });
    });
  },
}));
