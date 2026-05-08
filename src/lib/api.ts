const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8080/api'
  : '/api';

const WS_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'ws://localhost:8080'
  : (typeof window !== 'undefined' ? (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host : '');

let ws: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export interface User {
  id: string;
  phone: string;
  displayPhone: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isAdmin?: boolean;
  online: boolean;
  lastSeen: number;
  createdAt: number;
  phoneVisible?: boolean;
}

export interface Chat {
  id: string;
  type: 'private' | 'group' | 'channel';
  name: string;
  avatar: string;
  participants: string[];
  description?: string;
  createdBy?: string;
  createdAt: number;
  lastMessage?: Message;
  lastMessageTime?: number;
  pinned: string[];
  muted: string[];
  unread: Record<string, number>;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  replyTo: string | null;
  timestamp: number;
  read: string[];
  edited: boolean;
}

class API {
  private token: string | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async sendCode(phone: string) {
    return this.request('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyCode(phone: string, code: string) {
    const result = await this.request('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async register(phone: string, name: string, username: string, avatar: string) {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, name, username, avatar }),
    });

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
      this.disconnectWS();
    }
  }

  // Users
  async getMe(): Promise<User> {
    return this.request('/users/me');
  }

  async updateMe(updates: Partial<User>): Promise<User> {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  // Chats
  async getChats(): Promise<Chat[]> {
    return this.request('/chats');
  }

  async createChat(type: string, participants: string[], name?: string, avatar?: string, description?: string): Promise<Chat> {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify({ type, participants, name, avatar, description }),
    });
  }

  // Messages
  async getMessages(chatId: string): Promise<Message[]> {
    return this.request(`/chats/${chatId}/messages`);
  }

  async sendMessage(chatId: string, text: string, replyTo?: string): Promise<Message> {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, replyTo }),
    });
  }

  async editMessage(messageId: string, text: string): Promise<Message> {
    return this.request(`/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ text }),
    });
  }

  async deleteMessage(messageId: string) {
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  // WebSocket
  connectWS() {
    if (!this.token || ws) return;

    const url = `${WS_URL}?token=${this.token}`;
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      ws = null;
      
      if (this.token && !reconnectTimer) {
        reconnectTimer = setTimeout(() => this.connectWS(), 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnectWS() {
    if (ws) {
      ws.close();
      ws = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  sendWS(data: any) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

export const api = new API();
