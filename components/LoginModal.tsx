import React, { useState, useEffect } from 'react';
import { User, Config } from '../types';
import { XIcon, LockIcon } from './icons/Icons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  users: User[];
  config: Config;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin, users, config, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        } else {
            // Clear fields if no email is remembered
            setEmail('');
            setRememberMe(false);
        }
        setPassword('');
        setError('');
    }
  }, [isOpen]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        if (user.status === 'active') {
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', user.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            onLogin(user);
        } else {
            setError('Tài khoản của bạn đã bị ngưng hoạt động.');
        }
    } else {
      setError('Email hoặc mật khẩu không chính xác.');
    }
  };
  
  if (!isOpen) return null;

  const developerCredit = config.developerUrl ? (
    <a href={config.developerUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{config.developerName}</a>
  ) : (
    <span>{config.developerName}</span>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
         <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
            <span className="sr-only">Đóng</span>
            <XIcon className="h-6 w-6" />
        </button>
        <div className="flex justify-center mb-6">
            {config.logo ? (
                <img src={config.logo} alt={config.companyName} className="h-10 w-auto" />
            ) : (
                <h2 className="text-2xl font-bold text-center text-gray-800">{config.companyName}</h2>
            )}
        </div>
        <h3 className="text-xl font-semibold text-center text-gray-700 mb-6">Đăng nhập vào hệ thống</h3>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"
            />
          </div>
          <div className="flex items-center">
            <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Ghi nhớ tài khoản
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]"
            >
              Đăng nhập
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-xs text-gray-400">
            <p>Phát triển bởi {developerCredit}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;