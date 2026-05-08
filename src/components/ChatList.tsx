import { useState } from 'react';
import { useStore } from '../store/store';
import { MenuIcon, SearchIcon, EditIcon, SettingsIcon, LogoutIcon, UserIcon, MoonIcon, SunIcon } from './Icons';

export default function ChatList() {
  const { chats, activeChatId, setActiveChat, currentUser, users, logout, theme, toggleTheme, searchQuery, setSearchQuery } = useStore();
  const [showMenu, setShowMenu] = useState(false);

  const filtered = chats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-sidebar)' }}>
      <div className="h-14 flex items-center px-4 gap-3" style={{ background: 'var(--bg-header)' }}>
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-white/10">
          <MenuIcon size={20} color="white" />
        </button>
        <h1 className="text-white font-semibold flex-1">ChillGram</h1>
        <button className="p-2 rounded-full hover:bg-white/10">
          <SearchIcon size={20} color="white" />
        </button>
      </div>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'var(--bg-overlay)' }} onClick={() => setShowMenu(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 z-50" style={{ background: 'var(--bg-primary)' }}>
            <div className="p-4" style={{ background: 'var(--bg-header)' }}>
              <div className="w-16 h-16 rounded-full mb-3 flex items-center justify-center text-white text-2xl font-bold" 
                style={{ background: currentUser?.avatar?.startsWith('#') ? currentUser.avatar : 'var(--accent)' }}>
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-semibold">{currentUser?.name}</p>
              <p className="text-white/70 text-sm">@{currentUser?.username}</p>
            </div>
            <button onClick={() => { setShowMenu(false); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-hover)]">
              <UserIcon size={20} color="var(--text-secondary)" />
              <span style={{ color: 'var(--text-primary)' }}>Profile</span>
            </button>
            <button onClick={() => { toggleTheme(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-hover)]">
              {theme === 'dark' ? <SunIcon size={20} color="var(--text-secondary)" /> : <MoonIcon size={20} color="var(--text-secondary)" />}
              <span style={{ color: 'var(--text-primary)' }}>{theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
            </button>
            <button onClick={() => { setShowMenu(false); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-hover)]">
              <SettingsIcon size={20} color="var(--text-secondary)" />
              <span style={{ color: 'var(--text-primary)' }}>Settings</span>
            </button>
            <div className="h-px" style={{ background: 'var(--divider)' }} />
            <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-hover)]">
              <LogoutIcon size={20} color="#e53935" />
              <span style={{ color: '#e53935' }}>Logout</span>
            </button>
          </div>
        </>
      )}

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: 'var(--search-bg)' }}>
          <SearchIcon size={16} color="var(--text-secondary)" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(chat => {
          const isActive = chat.id === activeChatId;
          const user = chat.type === 'private' ? users.get(chat.participants.find(p => p !== currentUser?.id) || '') : null;
          return (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-hover)]"
              style={{ background: isActive ? 'var(--accent)' : 'transparent' }}
            >
              <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-semibold relative" 
                style={{ background: isActive ? 'rgba(255,255,255,0.2)' : (chat.avatar?.startsWith('#') ? chat.avatar : 'var(--accent-light)') }}>
                {!chat.avatar?.startsWith('#') && chat.name.charAt(0).toUpperCase()}
                {user?.online && (
                  <div className="w-3 h-3 rounded-full absolute bottom-0 right-0" style={{ 
                    background: 'var(--text-online)',
                    border: '2px solid ' + (isActive ? 'var(--accent)' : 'var(--bg-sidebar)')
                  }} />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold truncate" style={{ color: isActive ? 'white' : 'var(--text-primary)' }}>{chat.name}</p>
                <p className="text-sm truncate" style={{ color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                  {chat.lastMessage?.text || 'No messages'}
                </p>
              </div>
              {chat.lastMessage && (
                <span className="text-xs shrink-0" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                  {new Date(chat.lastMessage.timestamp).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button className="absolute bottom-5 right-5 w-14 h-14 rounded-full shadow-lg" style={{ background: 'var(--accent)' }}>
        <EditIcon size={22} color="white" />
      </button>
    </div>
  );
}
