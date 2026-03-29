import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Cloud } from 'lucide-react';
import { motion } from 'motion/react';

import { UserRole } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  clientId?: string;
}

const VALID_CREDENTIALS: LoginCredentials[] = [
  { email: 'admin@skyflow.com', password: 'skyflow2025', role: 'admin', name: 'Ana Silva' },
  { email: 'vilacarioca@skyflow.com', password: 'skyflow2025', role: 'client', name: 'Vila Carioca', clientId: '4' },
  { email: 'techstart@skyflow.com', password: 'skyflow2025', role: 'client', name: 'TechStart', clientId: '1' },
  { email: 'greenlife@skyflow.com', password: 'skyflow2025', role: 'client', name: 'GreenLife', clientId: '2' },
];

interface LoginViewProps {
  onLogin: (role: UserRole, clientId?: string) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (!email || !password) {
        setError('Por favor, preencha todos os campos.');
        return;
      }

      const match = VALID_CREDENTIALS.find(
        c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      );

      if (match) {
        onLogin(match.role, match.clientId);
      } else {
        setError('Email ou senha inválidos.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-500">
            <Cloud className="w-10 h-10 fill-current" />
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">SkyFlow</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-800/50 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bem-vindo de volta</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all dark:text-white backdrop-blur-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all dark:text-white backdrop-blur-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50/50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-sky-200 dark:shadow-sky-900/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            Acesso restrito. Contate o administrador para obter credenciais.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
