import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { api } from '../lib/api';
import { BackIcon, CheckIcon } from './Icons';

const AVATARS = [
  '#4DCD5E', '#3390EC', '#E35454', '#EF9234', '#A695E7',
  '#72B5F8', '#F76F8E', '#4DD4C6', '#FF6B9D', '#7665EB',
  '#37C69A', '#F5A623'
];

const COUNTRIES: Record<string, { name: string; code: string; color: string }> = {
  '7': { name: 'Russia', code: '+7', color: '#0039A6' },
  '1': { name: 'USA/Canada', code: '+1', color: '#B22234' },
  '380': { name: 'Ukraine', code: '+380', color: '#005BBB' },
  '375': { name: 'Belarus', code: '+375', color: '#C8313E' },
  '44': { name: 'UK', code: '+44', color: '#012169' },
  '49': { name: 'Germany', code: '+49', color: '#000000' },
  '33': { name: 'France', code: '+33', color: '#0055A4' },
  '39': { name: 'Italy', code: '+39', color: '#009246' },
  '34': { name: 'Spain', code: '+34', color: '#AA151B' },
  '48': { name: 'Poland', code: '+48', color: '#DC143C' },
};

function detectCountry(phone: string): { name: string; code: string; color: string } | null {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  
  // Check 3-digit codes first
  const code3 = digits.substring(0, 3);
  if (COUNTRIES[code3]) return COUNTRIES[code3];
  
  // Check 2-digit codes
  const code2 = digits.substring(0, 2);
  if (COUNTRIES[code2]) return COUNTRIES[code2];
  
  // Check 1-digit codes
  const code1 = digits.substring(0, 1);
  if (COUNTRIES[code1]) return COUNTRIES[code1];
  
  return null;
}

export default function Login() {
  const [step, setStep] = useState<'phone' | 'code' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useStore(s => s.login);
  const register = useStore(s => s.register);

  const country = detectCountry(phone);

  useEffect(() => {
    // Ensure light theme for login
    document.documentElement.classList.add('theme-light');
  }, []);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    let formatted = '+' + digits[0];
    
    // Format based on country
    if (digits[0] === '7') {
      // Russia: +7 XXX XXX XX XX
      if (digits.length > 1) formatted += ' ' + digits.substring(1, 4);
      if (digits.length > 4) formatted += ' ' + digits.substring(4, 7);
      if (digits.length > 7) formatted += ' ' + digits.substring(7, 9);
      if (digits.length > 9) formatted += ' ' + digits.substring(9, 11);
    } else if (digits[0] === '1') {
      // USA: +1 XXX XXX XXXX
      if (digits.length > 1) formatted += ' ' + digits.substring(1, 4);
      if (digits.length > 4) formatted += ' ' + digits.substring(4, 7);
      if (digits.length > 7) formatted += ' ' + digits.substring(7, 11);
    } else {
      // Other: +XX XXX XXX XXX
      let pos = 1;
      while (pos < digits.length) {
        formatted += ' ' + digits.substring(pos, Math.min(pos + 3, digits.length));
        pos += 3;
      }
    }
    
    return formatted.substring(0, 20); // limit length
  };

  const handlePhoneSubmit = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.sendCode('+' + digits);
      setStep('code');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (code.length < 4) {
      setError('Enter code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const digits = phone.replace(/\D/g, '');
      const result = await login('+' + digits, code);
      if (result.isNewUser) {
        setStep('register');
      } else {
        // Keep light theme after login
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      setError('Enter your name');
      return;
    }
    if (!username.trim()) {
      setError('Enter username');
      return;
    }
    if (username.length < 5) {
      setError('Username min 5 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const digits = phone.replace(/\D/g, '');
      await register('+' + digits, name.trim(), username.trim(), avatar);
      // Keep light theme after registration
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-4" style={{ background: 'var(--bg-secondary)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>ChillGram</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Secure Messenger</p>
        </div>

        {step === 'phone' && (
          <div>
            <div className="mb-2 relative">
              {country && (
                <div className="absolute left-4 top-1/2 w-6 h-6 rounded-full" style={{ transform: 'translateY(-50%)', background: country.color }}></div>
              )}
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="+7 999 123 45 67"
                className="w-full px-4 py-3 rounded-xl text-base border-2 transition"
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border)',
                  paddingLeft: country ? '3.5rem' : '1rem',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
              />
            </div>
            {country && (
              <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                {country.name}
              </p>
            )}
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              onClick={handlePhoneSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-medium transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Sending...' : 'Next'}
            </button>
          </div>
        )}

        {step === 'code' && (
          <div>
            <p className="text-center text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Code sent to <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{phone}</span>
            </p>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Confirmation code"
              className="w-full px-4 py-3 rounded-xl mb-2 text-base text-center tracking-widest border-2"
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              onClick={handleCodeSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-medium transition hover:opacity-90 disabled:opacity-50 mb-2"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>
            <button
              onClick={() => { setStep('phone'); setCode(''); setError(''); }}
              className="w-full py-2 text-sm flex items-center justify-center gap-2"
              style={{ color: 'var(--accent)' }}
            >
              <BackIcon size={16} color="currentColor" /> Change number
            </button>
          </div>
        )}

        {step === 'register' && (
          <div>
            <p className="text-center text-sm mb-6 font-medium" style={{ color: 'var(--text-primary)' }}>
              Create Account
            </p>
            
            <div className="mb-6">
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Choose avatar color</p>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map(color => (
                  <button
                    key={color}
                    onClick={() => setAvatar(color)}
                    className="w-full aspect-square rounded-xl border-2 transition relative overflow-hidden"
                    style={{
                      borderColor: avatar === color ? 'var(--accent)' : 'var(--border)',
                      background: color,
                    }}
                  >
                    {avatar === color && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <CheckIcon size={20} color="white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="First and Last Name"
              className="w-full px-4 py-3 rounded-xl mb-3 text-base border-2"
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              autoFocus
            />

            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="username (min 5 chars)"
              className="w-full px-4 py-3 rounded-xl mb-2 text-base border-2"
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-medium transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Creating...' : 'Start Messaging'}
            </button>
          </div>
        )}

        <p className="text-xs text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
          © 2024–2026 ChillGram™
        </p>
      </div>
    </div>
  );
}
