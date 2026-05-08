import { useEffect } from 'react';
import { useStore } from './store/store';
import Login from './components/Login';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const { isLoggedIn, loadMe, theme, activeChatId } = useStore();

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadMe();
    }
  }, [loadMe]);

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="h-full flex" style={{ background: 'var(--bg-chat)' }}>
      <div
        className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] shrink-0`}
        style={{ borderRight: '1px solid var(--divider)' }}
      >
        <ChatList />
      </div>
      <div className={`${activeChatId ? 'flex' : 'hidden md:flex'} flex-1`}>
        <ChatWindow />
      </div>
    </div>
  );
}
