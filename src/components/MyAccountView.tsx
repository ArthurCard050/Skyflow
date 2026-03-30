import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Phone, Lock, Save, Camera, Building2,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { dbService } from '../services/db';
import { useToast } from './Toast';
import { ROLE_LABELS, ROLE_COLORS } from '../config/roleConfig';

export function MyAccountView() {
  const { profile, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { addToast('Nome é obrigatório.', 'error'); return; }
    setIsSavingProfile(true);
    try {
      const avatar = name.substring(0, 2).toUpperCase();
      await dbService.updateProfile(profile!.id, { name: name.trim(), phone, avatar });
      await refreshProfile();
      addToast('Perfil atualizado com sucesso!', 'success');
    } catch (err: any) {
      addToast('Erro ao salvar perfil: ' + err.message, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) { setPasswordError('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('As senhas não coincidem.'); return; }
    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('Senha alterada com sucesso!', 'success');
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (!profile) return null;

  const roleLabel = ROLE_LABELS[profile.role];
  const roleColor = ROLE_COLORS[profile.role];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Minha Conta</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas informações pessoais e segurança.</p>
      </div>

      {/* Avatar + Role Card */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-gray-700/50 shadow-sm p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {profile.avatar}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Camera className="w-3.5 h-3.5 text-gray-500" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold text-gray-900 dark:text-white truncate">{profile.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{profile.email}</p>
          <span className={`inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${roleColor}`}>
            <User className="w-3 h-3" />
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-white/20 dark:border-gray-700/50">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-sky-500" /> Informações Pessoais
          </h3>
        </div>
        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none dark:text-white text-sm transition-all"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Celular</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none dark:text-white text-sm transition-all"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Função</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={roleLabel}
                  disabled
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md shadow-sky-200 dark:shadow-sky-900/30 disabled:opacity-60"
            >
              {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Perfil
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-gray-700/50 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-white/20 dark:border-gray-700/50">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-500" /> Alterar Senha
          </h3>
        </div>
        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none dark:text-white text-sm transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmar Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none dark:text-white text-sm transition-all"
                  placeholder="Repita a nova senha"
                />
              </div>
            </div>
          </div>
          <AnimatePresence>
            {passwordError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {passwordError}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingPassword || !newPassword}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md shadow-sky-200 dark:shadow-sky-900/30 disabled:opacity-60"
            >
              {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Alterar Senha
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
