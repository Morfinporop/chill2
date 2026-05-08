import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { api } from '../lib/api';
import { BackIcon, SendIcon, AttachIcon, MicIcon, CheckIcon, CheckDoubleIcon } from './Icons';

export default function ChatWindow() {
  const { activeChatId, chats, messages, currentUser, users, setActiveChat, typing } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  let typingTimeout: NodeJS.Timeout;

  const chat = chats.find(c => c.id === activeChatId);
  const chatMsgs = activeChatId ? messages.get(activeChatId) || [] : [];
  const otherUser = chat?.type === 'private' ? users.get(chat.participants.find(p => p !== currentUser?.id) || '') : null;
  const isTyping = activeChatId ? typing.get(activeChatId)?.size || 0 : 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMsgs.length]);

  const handleSend = async () => {
    if (!input.trim() || !activeChatId) return;
    const text = input.trim();
    setInput('');
    await api.sendMessage(activeChatId, text);
    api.sendWS({ type: 'typing', chatId: activeChatId, isTyping: false });
  };

  const handleTyping = (val: string) => {
    setInput(val);
    if (!activeChatId) return;
    
    if (typingTimeout) clearTimeout(typingTimeout);
    api.sendWS({ type: 'typing', chatId: activeChatId, isTyping: true });
    
    typingTimeout = setTimeout(() => {
      api.sendWS({ type: 'typing', chatId: activeChatId, isTyping: false });
    }, 1000);
  };

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center chat-bg-pattern">
        <div className="text-center">
          <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>Select a chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-14 flex items-center px-4 gap-3" style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--divider)' }}>
        <button onClick={() => setActiveChat(null)} className="p-2 rounded-full hover:bg-white/10 md:hidden">
          <BackIcon size={20} color="white" />
        </button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold relative" 
          style={{ background: chat.avatar?.startsWith('#') ? chat.avatar : 'rgba(255,255,255,0.2)' }}>
          {!chat.avatar?.startsWith('#') && chat.name.charAt(0).toUpperCase()}
          {otherUser?.online && (
            <div className="w-2 h-2 rounded-full absolute bottom-0 right-0" style={{ 
              background: 'var(--text-online)',
              border: '2px solid var(--bg-header)'
            }} />
          )}
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">{chat.name}</p>
          <p className="text-white/70 text-xs">
            {isTyping > 0 ? 'typing...' : otherUser?.online ? 'online' : 'offline'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto chat-bg-pattern p-4">
        {chatMsgs.map(msg => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
              <div
                className="max-w-[75%] px-3 py-2 rounded-xl"
                style={{ background: isMe ? 'var(--bg-message-out)' : 'var(--bg-message-in)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{msg.text}</p>
                <div className="flex items-center gap-1 justify-end mt-1">
                  <span className="text-[10px]" style={{ color: isMe ? 'var(--text-time)' : 'var(--text-time-in)' }}>
                    {new Date(msg.timestamp).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    msg.read.length > 1 ? (
                      <CheckDoubleIcon size={14} color="var(--check-read)" />
                    ) : (
                      <CheckIcon size={14} color="var(--check-unread)" />
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'var(--bg-input)', borderTop: '1px solid var(--divider)' }}>
        <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]">
          <AttachIcon size={20} color="var(--text-secondary)" />
        </button>
        <input
          value={input}
          onChange={e => handleTyping(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Message"
          className="flex-1 px-4 py-2 rounded-full text-sm outline-none"
          style={{ background: 'var(--search-bg)', color: 'var(--text-primary)' }}
        />
        {input.trim() ? (
          <button onClick={handleSend} className="p-2 rounded-full" style={{ background: 'var(--accent)' }}>
            <SendIcon size={20} color="white" />
          </button>
        ) : (
          <button className="p-2 rounded-full hover:bg-[var(--bg-hover)]">
            <MicIcon size={20} color="var(--text-secondary)" />
          </button>
        )}
      </div>
    </div>
  );
}
