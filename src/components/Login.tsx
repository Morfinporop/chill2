import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { api } from '../lib/api';
import { BackIcon, CheckIcon } from './Icons';

const AVATARS = [
  '#4DCD5E', '#3390EC', '#E35454', '#EF9234', '#A695E7',
  '#72B5F8', '#F76F8E', '#4DD4C6', '#FF6B9D', '#7665EB',
  '#37C69A', '#F5A623'
];

const COUNTRIES: Record<string, { name: string; code: string; flag: string }> = {
  '7': { name: 'Russia', code: '+7', flag: '🇷🇺' },
  '1': { name: 'USA', code: '+1', flag: '🇺🇸' },
  '1242': { name: 'Bahamas', code: '+1242', flag: '🇧🇸' },
  '1246': { name: 'Barbados', code: '+1246', flag: '🇧🇧' },
  '1264': { name: 'Anguilla', code: '+1264', flag: '🇦🇮' },
  '1268': { name: 'Antigua', code: '+1268', flag: '🇦🇬' },
  '1284': { name: 'Virgin Islands', code: '+1284', flag: '🇻🇬' },
  '1340': { name: 'US Virgin Islands', code: '+1340', flag: '🇻🇮' },
  '1441': { name: 'Bermuda', code: '+1441', flag: '🇧🇲' },
  '1473': { name: 'Grenada', code: '+1473', flag: '🇬🇩' },
  '1649': { name: 'Turks and Caicos', code: '+1649', flag: '🇹🇨' },
  '1664': { name: 'Montserrat', code: '+1664', flag: '🇲🇸' },
  '1670': { name: 'Northern Mariana', code: '+1670', flag: '🇲🇵' },
  '1671': { name: 'Guam', code: '+1671', flag: '🇬🇺' },
  '1684': { name: 'American Samoa', code: '+1684', flag: '🇦🇸' },
  '1758': { name: 'Saint Lucia', code: '+1758', flag: '🇱🇨' },
  '1767': { name: 'Dominica', code: '+1767', flag: '🇩🇲' },
  '1784': { name: 'Saint Vincent', code: '+1784', flag: '🇻🇨' },
  '1787': { name: 'Puerto Rico', code: '+1787', flag: '🇵🇷' },
  '1809': { name: 'Dominican Rep', code: '+1809', flag: '🇩🇴' },
  '1868': { name: 'Trinidad', code: '+1868', flag: '🇹🇹' },
  '1869': { name: 'Saint Kitts', code: '+1869', flag: '🇰🇳' },
  '1876': { name: 'Jamaica', code: '+1876', flag: '🇯🇲' },
  '20': { name: 'Egypt', code: '+20', flag: '🇪🇬' },
  '27': { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  '30': { name: 'Greece', code: '+30', flag: '🇬🇷' },
  '31': { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
  '32': { name: 'Belgium', code: '+32', flag: '🇧🇪' },
  '33': { name: 'France', code: '+33', flag: '🇫🇷' },
  '34': { name: 'Spain', code: '+34', flag: '🇪🇸' },
  '36': { name: 'Hungary', code: '+36', flag: '🇭🇺' },
  '39': { name: 'Italy', code: '+39', flag: '🇮🇹' },
  '40': { name: 'Romania', code: '+40', flag: '🇷🇴' },
  '41': { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
  '43': { name: 'Austria', code: '+43', flag: '🇦🇹' },
  '44': { name: 'UK', code: '+44', flag: '🇬🇧' },
  '45': { name: 'Denmark', code: '+45', flag: '🇩🇰' },
  '46': { name: 'Sweden', code: '+46', flag: '🇸🇪' },
  '47': { name: 'Norway', code: '+47', flag: '🇳🇴' },
  '48': { name: 'Poland', code: '+48', flag: '🇵🇱' },
  '49': { name: 'Germany', code: '+49', flag: '🇩🇪' },
  '51': { name: 'Peru', code: '+51', flag: '🇵🇪' },
  '52': { name: 'Mexico', code: '+52', flag: '🇲🇽' },
  '53': { name: 'Cuba', code: '+53', flag: '🇨🇺' },
  '54': { name: 'Argentina', code: '+54', flag: '🇦🇷' },
  '55': { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  '56': { name: 'Chile', code: '+56', flag: '🇨🇱' },
  '57': { name: 'Colombia', code: '+57', flag: '🇨🇴' },
  '58': { name: 'Venezuela', code: '+58', flag: '🇻🇪' },
  '60': { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
  '61': { name: 'Australia', code: '+61', flag: '🇦🇺' },
  '62': { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
  '63': { name: 'Philippines', code: '+63', flag: '🇵🇭' },
  '64': { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
  '65': { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  '66': { name: 'Thailand', code: '+66', flag: '🇹🇭' },
  '81': { name: 'Japan', code: '+81', flag: '🇯🇵' },
  '82': { name: 'South Korea', code: '+82', flag: '🇰🇷' },
  '84': { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
  '86': { name: 'China', code: '+86', flag: '🇨🇳' },
  '90': { name: 'Turkey', code: '+90', flag: '🇹🇷' },
  '91': { name: 'India', code: '+91', flag: '🇮🇳' },
  '92': { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
  '93': { name: 'Afghanistan', code: '+93', flag: '🇦🇫' },
  '94': { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
  '95': { name: 'Myanmar', code: '+95', flag: '🇲🇲' },
  '98': { name: 'Iran', code: '+98', flag: '🇮🇷' },
  '212': { name: 'Morocco', code: '+212', flag: '🇲🇦' },
  '213': { name: 'Algeria', code: '+213', flag: '🇩🇿' },
  '216': { name: 'Tunisia', code: '+216', flag: '🇹🇳' },
  '218': { name: 'Libya', code: '+218', flag: '🇱🇾' },
  '220': { name: 'Gambia', code: '+220', flag: '🇬🇲' },
  '221': { name: 'Senegal', code: '+221', flag: '🇸🇳' },
  '222': { name: 'Mauritania', code: '+222', flag: '🇲🇷' },
  '223': { name: 'Mali', code: '+223', flag: '🇲🇱' },
  '224': { name: 'Guinea', code: '+224', flag: '🇬🇳' },
  '225': { name: 'Ivory Coast', code: '+225', flag: '🇨🇮' },
  '226': { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
  '227': { name: 'Niger', code: '+227', flag: '🇳🇪' },
  '228': { name: 'Togo', code: '+228', flag: '🇹🇬' },
  '229': { name: 'Benin', code: '+229', flag: '🇧🇯' },
  '230': { name: 'Mauritius', code: '+230', flag: '🇲🇺' },
  '231': { name: 'Liberia', code: '+231', flag: '🇱🇷' },
  '232': { name: 'Sierra Leone', code: '+232', flag: '🇸🇱' },
  '233': { name: 'Ghana', code: '+233', flag: '🇬🇭' },
  '234': { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  '235': { name: 'Chad', code: '+235', flag: '🇹🇩' },
  '236': { name: 'Central African', code: '+236', flag: '🇨🇫' },
  '237': { name: 'Cameroon', code: '+237', flag: '🇨🇲' },
  '238': { name: 'Cape Verde', code: '+238', flag: '🇨🇻' },
  '239': { name: 'Sao Tome', code: '+239', flag: '🇸🇹' },
  '240': { name: 'Equatorial Guinea', code: '+240', flag: '🇬🇶' },
  '241': { name: 'Gabon', code: '+241', flag: '🇬🇦' },
  '242': { name: 'Congo', code: '+242', flag: '🇨🇬' },
  '243': { name: 'DR Congo', code: '+243', flag: '🇨🇩' },
  '244': { name: 'Angola', code: '+244', flag: '🇦🇴' },
  '245': { name: 'Guinea-Bissau', code: '+245', flag: '🇬🇼' },
  '246': { name: 'Diego Garcia', code: '+246', flag: '🇮🇴' },
  '248': { name: 'Seychelles', code: '+248', flag: '🇸🇨' },
  '249': { name: 'Sudan', code: '+249', flag: '🇸🇩' },
  '250': { name: 'Rwanda', code: '+250', flag: '🇷🇼' },
  '251': { name: 'Ethiopia', code: '+251', flag: '🇪🇹' },
  '252': { name: 'Somalia', code: '+252', flag: '🇸🇴' },
  '253': { name: 'Djibouti', code: '+253', flag: '🇩🇯' },
  '254': { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  '255': { name: 'Tanzania', code: '+255', flag: '🇹🇿' },
  '256': { name: 'Uganda', code: '+256', flag: '🇺🇬' },
  '257': { name: 'Burundi', code: '+257', flag: '🇧🇮' },
  '258': { name: 'Mozambique', code: '+258', flag: '🇲🇿' },
  '260': { name: 'Zambia', code: '+260', flag: '🇿🇲' },
  '261': { name: 'Madagascar', code: '+261', flag: '🇲🇬' },
  '262': { name: 'Reunion', code: '+262', flag: '🇷🇪' },
  '263': { name: 'Zimbabwe', code: '+263', flag: '🇿🇼' },
  '264': { name: 'Namibia', code: '+264', flag: '🇳🇦' },
  '265': { name: 'Malawi', code: '+265', flag: '🇲🇼' },
  '266': { name: 'Lesotho', code: '+266', flag: '🇱🇸' },
  '267': { name: 'Botswana', code: '+267', flag: '🇧🇼' },
  '268': { name: 'Swaziland', code: '+268', flag: '🇸🇿' },
  '269': { name: 'Comoros', code: '+269', flag: '🇰🇲' },
  '290': { name: 'Saint Helena', code: '+290', flag: '🇸🇭' },
  '291': { name: 'Eritrea', code: '+291', flag: '🇪🇷' },
  '297': { name: 'Aruba', code: '+297', flag: '🇦🇼' },
  '298': { name: 'Faroe Islands', code: '+298', flag: '🇫🇴' },
  '299': { name: 'Greenland', code: '+299', flag: '🇬🇱' },
  '350': { name: 'Gibraltar', code: '+350', flag: '🇬🇮' },
  '351': { name: 'Portugal', code: '+351', flag: '🇵🇹' },
  '352': { name: 'Luxembourg', code: '+352', flag: '🇱🇺' },
  '353': { name: 'Ireland', code: '+353', flag: '🇮🇪' },
  '354': { name: 'Iceland', code: '+354', flag: '🇮🇸' },
  '355': { name: 'Albania', code: '+355', flag: '🇦🇱' },
  '356': { name: 'Malta', code: '+356', flag: '🇲🇹' },
  '357': { name: 'Cyprus', code: '+357', flag: '🇨🇾' },
  '358': { name: 'Finland', code: '+358', flag: '🇫🇮' },
  '359': { name: 'Bulgaria', code: '+359', flag: '🇧🇬' },
  '370': { name: 'Lithuania', code: '+370', flag: '🇱🇹' },
  '371': { name: 'Latvia', code: '+371', flag: '🇱🇻' },
  '372': { name: 'Estonia', code: '+372', flag: '🇪🇪' },
  '373': { name: 'Moldova', code: '+373', flag: '🇲🇩' },
  '374': { name: 'Armenia', code: '+374', flag: '🇦🇲' },
  '375': { name: 'Belarus', code: '+375', flag: '🇧🇾' },
  '376': { name: 'Andorra', code: '+376', flag: '🇦🇩' },
  '377': { name: 'Monaco', code: '+377', flag: '🇲🇨' },
  '378': { name: 'San Marino', code: '+378', flag: '🇸🇲' },
  '380': { name: 'Ukraine', code: '+380', flag: '🇺🇦' },
  '381': { name: 'Serbia', code: '+381', flag: '🇷🇸' },
  '382': { name: 'Montenegro', code: '+382', flag: '🇲🇪' },
  '383': { name: 'Kosovo', code: '+383', flag: '🇽🇰' },
  '385': { name: 'Croatia', code: '+385', flag: '🇭🇷' },
  '386': { name: 'Slovenia', code: '+386', flag: '🇸🇮' },
  '387': { name: 'Bosnia', code: '+387', flag: '🇧🇦' },
  '389': { name: 'Macedonia', code: '+389', flag: '🇲🇰' },
  '420': { name: 'Czech Republic', code: '+420', flag: '🇨🇿' },
  '421': { name: 'Slovakia', code: '+421', flag: '🇸🇰' },
  '423': { name: 'Liechtenstein', code: '+423', flag: '🇱🇮' },
  '500': { name: 'Falkland Islands', code: '+500', flag: '🇫🇰' },
  '501': { name: 'Belize', code: '+501', flag: '🇧🇿' },
  '502': { name: 'Guatemala', code: '+502', flag: '🇬🇹' },
  '503': { name: 'El Salvador', code: '+503', flag: '🇸🇻' },
  '504': { name: 'Honduras', code: '+504', flag: '🇭🇳' },
  '505': { name: 'Nicaragua', code: '+505', flag: '🇳🇮' },
  '506': { name: 'Costa Rica', code: '+506', flag: '🇨🇷' },
  '507': { name: 'Panama', code: '+507', flag: '🇵🇦' },
  '508': { name: 'Saint Pierre', code: '+508', flag: '🇵🇲' },
  '509': { name: 'Haiti', code: '+509', flag: '🇭🇹' },
  '590': { name: 'Guadeloupe', code: '+590', flag: '🇬🇵' },
  '591': { name: 'Bolivia', code: '+591', flag: '🇧🇴' },
  '592': { name: 'Guyana', code: '+592', flag: '🇬🇾' },
  '593': { name: 'Ecuador', code: '+593', flag: '🇪🇨' },
  '594': { name: 'French Guiana', code: '+594', flag: '🇬🇫' },
  '595': { name: 'Paraguay', code: '+595', flag: '🇵🇾' },
  '596': { name: 'Martinique', code: '+596', flag: '🇲🇶' },
  '597': { name: 'Suriname', code: '+597', flag: '🇸🇷' },
  '598': { name: 'Uruguay', code: '+598', flag: '🇺🇾' },
  '599': { name: 'Netherlands Antilles', code: '+599', flag: '🇧🇶' },
  '670': { name: 'Timor-Leste', code: '+670', flag: '🇹🇱' },
  '672': { name: 'Antarctica', code: '+672', flag: '🇦🇶' },
  '673': { name: 'Brunei', code: '+673', flag: '🇧🇳' },
  '674': { name: 'Nauru', code: '+674', flag: '🇳🇷' },
  '675': { name: 'Papua New Guinea', code: '+675', flag: '🇵🇬' },
  '676': { name: 'Tonga', code: '+676', flag: '🇹🇴' },
  '677': { name: 'Solomon Islands', code: '+677', flag: '🇸🇧' },
  '678': { name: 'Vanuatu', code: '+678', flag: '🇻🇺' },
  '679': { name: 'Fiji', code: '+679', flag: '🇫🇯' },
  '680': { name: 'Palau', code: '+680', flag: '🇵🇼' },
  '681': { name: 'Wallis and Futuna', code: '+681', flag: '🇼🇫' },
  '682': { name: 'Cook Islands', code: '+682', flag: '🇨🇰' },
  '683': { name: 'Niue', code: '+683', flag: '🇳🇺' },
  '685': { name: 'Samoa', code: '+685', flag: '🇼🇸' },
  '686': { name: 'Kiribati', code: '+686', flag: '🇰🇮' },
  '687': { name: 'New Caledonia', code: '+687', flag: '🇳🇨' },
  '688': { name: 'Tuvalu', code: '+688', flag: '🇹🇻' },
  '689': { name: 'French Polynesia', code: '+689', flag: '🇵🇫' },
  '690': { name: 'Tokelau', code: '+690', flag: '🇹🇰' },
  '691': { name: 'Micronesia', code: '+691', flag: '🇫🇲' },
  '692': { name: 'Marshall Islands', code: '+692', flag: '🇲🇭' },
  '850': { name: 'North Korea', code: '+850', flag: '🇰🇵' },
  '852': { name: 'Hong Kong', code: '+852', flag: '🇭🇰' },
  '853': { name: 'Macau', code: '+853', flag: '🇲🇴' },
  '855': { name: 'Cambodia', code: '+855', flag: '🇰🇭' },
  '856': { name: 'Laos', code: '+856', flag: '🇱🇦' },
  '880': { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  '886': { name: 'Taiwan', code: '+886', flag: '🇹🇼' },
  '960': { name: 'Maldives', code: '+960', flag: '🇲🇻' },
  '961': { name: 'Lebanon', code: '+961', flag: '🇱🇧' },
  '962': { name: 'Jordan', code: '+962', flag: '🇯🇴' },
  '963': { name: 'Syria', code: '+963', flag: '🇸🇾' },
  '964': { name: 'Iraq', code: '+964', flag: '🇮🇶' },
  '965': { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
  '966': { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  '967': { name: 'Yemen', code: '+967', flag: '🇾🇪' },
  '968': { name: 'Oman', code: '+968', flag: '🇴🇲' },
  '970': { name: 'Palestine', code: '+970', flag: '🇵🇸' },
  '971': { name: 'UAE', code: '+971', flag: '🇦🇪' },
  '972': { name: 'Israel', code: '+972', flag: '🇮🇱' },
  '973': { name: 'Bahrain', code: '+973', flag: '🇧🇭' },
  '974': { name: 'Qatar', code: '+974', flag: '🇶🇦' },
  '975': { name: 'Bhutan', code: '+975', flag: '🇧🇹' },
  '976': { name: 'Mongolia', code: '+976', flag: '🇲🇳' },
  '977': { name: 'Nepal', code: '+977', flag: '🇳🇵' },
  '992': { name: 'Tajikistan', code: '+992', flag: '🇹🇯' },
  '993': { name: 'Turkmenistan', code: '+993', flag: '🇹🇲' },
  '994': { name: 'Azerbaijan', code: '+994', flag: '🇦🇿' },
  '995': { name: 'Georgia', code: '+995', flag: '🇬🇪' },
  '996': { name: 'Kyrgyzstan', code: '+996', flag: '🇰🇬' },
  '998': { name: 'Uzbekistan', code: '+998', flag: '🇺🇿' },
};

function detectCountry(phone: string): { name: string; code: string; flag: string } | null {
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
                <div className="absolute left-4 top-1/2" style={{ transform: 'translateY(-50%)', fontSize: '1.5rem' }}>
                  {country.flag}
                </div>
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
