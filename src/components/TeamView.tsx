import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Trash2, Edit2, Plus, X, Loader2, Phone, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import { TeamMemberRecord, UserRole } from '../types';
import { dbService } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS, ROLE_COLORS } from '../config/roleConfig';

const MEMBER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'copywriter', label: 'Copywriter' },
  { value: 'designer', label: 'Designer' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'client', label: 'Cliente Visualizador' },
];

export function TeamView() {
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [members, setMembers] = useState<TeamMemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('copywriter');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await dbService.getTeamMembers();
      setMembers(data);
    } catch (err: any) {
      addToast('Erro ao carregar equipe: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openAdd = () => {
    setEditingMember(null);
    setFormName(''); setFormEmail(''); setFormRole('copywriter');
    setFormPassword(''); setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (member: TeamMemberRecord) => {
    setEditingMember(member);
    setFormName(member.name); setFormEmail(member.email);
    setFormRole(member.role); setFormPassword(''); setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formName.trim() || !formEmail.trim()) { setFormError('Nome e email são obrigatórios.'); return; }

    setIsSaving(true);
    try {
      if (editingMember) {
        // Update role only
        await dbService.updateTeamMemberRole(editingMember.id, formRole);
        setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, role: formRole } : m));
        addToast('Função atualizada com sucesso!', 'success');
      } else {
        // Add new member
        if (!formPassword || formPassword.length < 6) { setFormError('A senha deve ter pelo menos 6 caracteres.'); setIsSaving(false); return; }
        const result = await dbService.addTeamMember(
          formEmail.trim(), formName.trim(), formPassword, formRole, profile!.ownerId
        );
        if (!result.success) { setFormError(result.error || 'Erro desconhecido'); setIsSaving(false); return; }
        addToast(`Membro ${formName} adicionado à equipe!`, 'success');
        await loadMembers();
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (memberId: string) => {
    try {
      await dbService.removeTeamMember(memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setDeleteTarget(null);
      addToast('Membro removido da equipe.', 'success');
    } catch (err: any) {
      addToast('Erro ao remover: ' + err.message, 'error');
    }
  };

  return (
    <>
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/40 dark:border-gray-700/50 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/20 dark:border-gray-700/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Membros da Equipe</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie quem tem acesso à sua agência.</p>
          </div>
          <button
            onClick={openAdd}
            className="w-full sm:w-auto bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-200 dark:shadow-sky-900/30"
          >
            <Plus className="w-4 h-4" /> Adicionar Membro
          </button>
        </div>

        {/* Members list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16">
            <User className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum membro ainda.</p>
            <p className="text-sm text-gray-400 mt-1">Adicione membros para colaborar.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/20 dark:divide-gray-700/50">
            {members.map(member => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 flex items-center justify-between hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/40 dark:to-indigo-900/40 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
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

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[member.role]}`}>
                    <Shield className="w-3 h-3" />
                    {ROLE_LABELS[member.role]}
                  </span>
                  <button onClick={() => openEdit(member)}
                    className="text-gray-400 hover:text-sky-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Editar função">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(member.id)}
                    className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover membro">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md pointer-events-auto overflow-hidden border border-white/40 dark:border-gray-700/50">
                <div className="p-6 border-b border-white/20 dark:border-gray-700/50 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingMember ? 'Editar Função' : 'Adicionar Membro'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" required value={formName} onChange={e => setFormName(e.target.value)} disabled={!!editingMember}
                        placeholder="Nome completo"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none bg-white/50 dark:bg-gray-900/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)} disabled={!!editingMember}
                        placeholder="email@exemplo.com"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none bg-white/50 dark:bg-gray-900/50 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed" />
                    </div>
                  </div>
                  {!editingMember && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Temporária</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none bg-white/50 dark:bg-gray-900/50 dark:text-white" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Compartilhe esta senha com o membro. Ele poderá alterá-la em Minha Conta.</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                    <select value={formRole} onChange={e => setFormRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none bg-white/50 dark:bg-gray-900/50 dark:text-white">
                      {MEMBER_ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <AnimatePresence>
                    {formError && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {formError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-md disabled:opacity-60 flex items-center gap-2">
                      {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {editingMember ? 'Salvar Função' : 'Adicionar Membro'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full pointer-events-auto">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Remover Membro?</h3>
                <p className="text-sm text-gray-500 mb-5">O membro perderá acesso à agência. A conta do usuário será mantida.</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    Cancelar
                  </button>
                  <button onClick={() => handleDelete(deleteTarget!)}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg">
                    Remover
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
