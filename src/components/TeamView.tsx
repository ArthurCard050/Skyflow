import React, { useState } from 'react';
import { User, Mail, Shield, Trash2, Edit2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import { TeamMember, UserRole } from '../types';

export function TeamView() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('copywriter');
  const { addToast } = useToast();
  
  const [team, setTeam] = useState<TeamMember[]>([
    { id: '1', name: 'Ana Silva', role: 'admin', email: 'ana@agencia.com', avatar: 'AS' },
    { id: '2', name: 'Carlos Lima', role: 'copywriter', email: 'carlos@agencia.com', avatar: 'CL' },
    { id: '3', name: 'Cliente Demo', role: 'client', email: 'cliente@demo.com', avatar: 'CD' },
  ]);

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este membro da equipe?')) {
      setTeam(team.filter(m => m.id !== id));
      addToast('Membro removido com sucesso.', 'success');
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setInviteName(member.name);
    setInviteEmail(member.email || '');
    setInviteRole(member.role);
    setIsInviteOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      addToast('Nome e email são obrigatórios', 'error');
      return;
    }

    if (editingMember) {
      setTeam(team.map(m => m.id === editingMember.id ? { ...m, name: inviteName, email: inviteEmail, role: inviteRole } : m));
      addToast('Membro atualizado com sucesso!', 'success');
    } else {
      const newMember: TeamMember = {
        id: Math.random().toString(36).substr(2, 9),
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        avatar: inviteName.substring(0, 2).toUpperCase()
      };
      setTeam([...team, newMember]);
      addToast(`Convite enviado para ${inviteEmail}`, 'success');
    }
    
    setIsInviteOpen(false);
    setEditingMember(null);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('copywriter');
  };

  return (
    <>
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/40 dark:border-gray-700/50 overflow-hidden transition-colors">
        <div className="p-6 border-b border-white/20 dark:border-gray-700/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Membros da Equipe</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie quem tem acesso ao projeto.</p>
          </div>
          <button 
            onClick={() => {
              setEditingMember(null);
              setInviteName('');
              setInviteEmail('');
              setInviteRole('copywriter');
              setIsInviteOpen(true);
            }}
            className="w-full sm:w-auto bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-200 dark:shadow-sky-900/30"
          >
            <Plus className="w-4 h-4" />
            Adicionar Membro
          </button>
        </div>
        
        <div className="divide-y divide-white/20 dark:divide-gray-700/50">
          {team.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors group">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {member.avatar}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 backdrop-blur-sm capitalize">
                  <Shield className="w-3 h-3" />
                  {member.role}
                </span>
                <button 
                  onClick={() => handleEditMember(member)}
                  className="text-gray-400 hover:text-sky-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteMember(member.id)}
                  className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md pointer-events-auto overflow-hidden border border-white/40 dark:border-gray-700/50">
                <div className="p-6 border-b border-white/20 dark:border-gray-700/50 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editingMember ? 'Editar Membro' : 'Adicionar Novo Membro'}</h3>
                  <button onClick={() => setIsInviteOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSaveMember} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                    <input
                      type="text"
                      required
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="Nome do membro"
                      className="w-full px-3 py-2 border border-white/30 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white/50 dark:bg-gray-900/50 dark:text-white backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="exemplo@empresa.com"
                      className="w-full px-3 py-2 border border-white/30 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white/50 dark:bg-gray-900/50 dark:text-white backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 border border-white/30 dark:border-gray-600/50 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white/50 dark:bg-gray-900/50 dark:text-white backdrop-blur-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="copywriter">Copywriter</option>
                      <option value="designer">Designer</option>
                      <option value="scheduler">Social Media (Scheduler)</option>
                      <option value="client">Cliente Visualizador</option>
                    </select>
                  </div>
                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsInviteOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-md shadow-sky-200 dark:shadow-sky-900/30"
                    >
                      {editingMember ? 'Salvar Alterações' : 'Adicionar Membro'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
